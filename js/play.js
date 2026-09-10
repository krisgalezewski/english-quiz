import { supabase } from "./supabase-client.js";
import { renderQuestion, gradeResponse } from "./question-types.js";
import { AVATARS } from "./avatars.js";
import { el, startCountdown } from "./utils.js";
import { playFanfare } from "./sound.js";

const state = {
  session: null,
  player: null,
  questions: [],
  currentHandle: null,
  currentResponse: null,
  hasAnsweredCurrent: false,
  stopTimer: null,
  celebrated: false,
};

const joinView = document.getElementById("join-view");
const waitingView = document.getElementById("waiting-view");
const questionView = document.getElementById("question-view");
const finishedView = document.getElementById("finished-view");

const codeInput = document.getElementById("code-input");
const nameInput = document.getElementById("name-input");
const avatarPicker = document.getElementById("avatar-picker");
const joinBtn = document.getElementById("join-btn");
const joinError = document.getElementById("join-error");

const otherPlayersEl = document.getElementById("other-players");
const questionContainer = document.getElementById("question-container");
const timerEl = document.getElementById("timer");
const questionProgressEl = document.getElementById("question-progress");
const myScoreEl = document.getElementById("my-score");
const finalScoreEl = document.getElementById("final-score");
const finalRankEl = document.getElementById("final-rank");
const finishedHeadlineEl = document.getElementById("finished-headline");
const finishedTrophyEl = document.getElementById("finished-trophy");
const practiceLinkEl = document.getElementById("practice-link");

let selectedAvatar = AVATARS[0];

function show(view) {
  [joinView, waitingView, questionView, finishedView].forEach((v) => (v.style.display = "none"));
  view.style.display = "block";
}

// ---------- Avatar picker ----------

AVATARS.forEach((a) => {
  const btn = el("button", "tile", a);
  btn.type = "button";
  btn.addEventListener("click", () => {
    selectedAvatar = a;
    avatarPicker.querySelectorAll(".tile").forEach((t) => t.classList.remove("selected"));
    btn.classList.add("selected");
  });
  avatarPicker.appendChild(btn);
});
avatarPicker.firstChild?.classList.add("selected");

// ---------- Join ----------

joinBtn.addEventListener("click", async () => {
  joinError.style.display = "none";
  const code = codeInput.value.trim().toUpperCase();
  const name = nameInput.value.trim();
  if (!code || !name) {
    joinError.textContent = "Enter a room code and your name.";
    joinError.style.display = "block";
    return;
  }

  const { data: session, error } = await supabase.from("sessions").select("*").eq("code", code).single();
  if (error || !session) {
    joinError.textContent = "No session found with that code.";
    joinError.style.display = "block";
    return;
  }
  if (session.status === "finished") {
    joinError.textContent = "That session has already finished.";
    joinError.style.display = "block";
    return;
  }

  const { data: player, error: joinErr } = await supabase
    .from("players")
    .insert({ session_id: session.id, name, avatar: selectedAvatar })
    .select()
    .single();
  if (joinErr) {
    joinError.textContent = "Could not join: " + joinErr.message;
    joinError.style.display = "block";
    return;
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", session.quiz_id)
    .order("position");

  state.session = session;
  state.player = player;
  state.questions = questions || [];

  subscribeToSession();
  subscribeToOtherPlayers();

  if (session.status === "lobby") {
    show(waitingView);
  } else {
    onSessionChange();
  }
});

// ---------- Realtime ----------

function subscribeToSession() {
  supabase
    .channel(`play-session:${state.session.id}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${state.session.id}` },
      (payload) => {
        state.session = payload.new;
        onSessionChange();
      }
    )
    .subscribe();
}

function subscribeToOtherPlayers() {
  supabase
    .channel(`play-players:${state.session.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `session_id=eq.${state.session.id}` },
      async () => {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("session_id", state.session.id)
          .order("joined_at");
        otherPlayersEl.innerHTML = "";
        (data || []).forEach((p) => {
          const chip = el("div", "player-chip");
          chip.innerHTML = `<span class="avatar">${p.avatar}</span><span>${p.name}</span>`;
          otherPlayersEl.appendChild(chip);
        });
        if (p_isMe(data)) syncMyScore(data);
      }
    )
    .subscribe();
}

function p_isMe(list) {
  return (list || []).some((p) => p.id === state.player.id);
}

function syncMyScore(list) {
  const me = (list || []).find((p) => p.id === state.player.id);
  if (me) {
    state.player = me;
    myScoreEl.textContent = me.score;
  }
}

// ---------- Question flow ----------

function currentQuestion() {
  return state.questions[state.session.current_question];
}

function onSessionChange() {
  if (state.stopTimer) {
    state.stopTimer();
    state.stopTimer = null;
  }
  if (state.session.status === "lobby") {
    show(waitingView);
  } else if (state.session.status === "question") {
    state.hasAnsweredCurrent = false;
    state.currentResponse = null;
    show(questionView);
    questionProgressEl.textContent = `${state.session.current_question + 1}/${state.questions.length}`;
    state.currentHandle = renderQuestion(questionContainer, currentQuestion(), handleSubmit);
    const seconds = state.session.time_limit_seconds || currentQuestion().time_limit_seconds || 20;
    state.stopTimer = startCountdown(timerEl, state.session.question_started_at, seconds, () => {
      questionContainer.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
    });
  } else if (state.session.status === "reveal") {
    timerEl.textContent = "--";
    if (state.currentHandle) {
      const correct = state.hasAnsweredCurrent
        ? gradeResponse(currentQuestion(), state.currentResponse)
        : false;
      state.currentHandle.showFeedback(state.currentResponse, correct);
    }
  } else if (state.session.status === "finished") {
    show(finishedView);
    if (!state.celebrated) {
      state.celebrated = true;
      showFinalResult();
    }
  }
}

async function handleSubmit(response) {
  if (state.hasAnsweredCurrent) return;
  state.hasAnsweredCurrent = true;
  state.currentResponse = response;

  const question = currentQuestion();
  const correct = gradeResponse(question, response);

  const { error } = await supabase.from("answers").insert({
    session_id: state.session.id,
    player_id: state.player.id,
    question_id: question.id,
    response,
    is_correct: correct,
  });
  if (error) return; // likely already answered (unique constraint) — safe to ignore

  if (correct) {
    const newScore = state.player.score + (question.points || 100);
    await supabase.from("players").update({ score: newScore }).eq("id", state.player.id);
  }
}

async function showFinalResult() {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", state.session.id)
    .order("score", { ascending: false });
  const list = data || [];
  const me = list.find((p) => p.id === state.player.id);
  const rank = list.findIndex((p) => p.id === state.player.id) + 1;
  finalScoreEl.textContent = me ? me.score : state.player.score;
  finalRankEl.textContent = rank ? `${rank} / ${list.length}` : "";
  practiceLinkEl.href = `practice.html?code=${state.session.code}`;

  const isWinner = rank === 1 && me && me.score > 0;
  if (isWinner) {
    finishedTrophyEl.textContent = "🏆";
    finishedHeadlineEl.textContent = "You won! 🎉";
  } else {
    finishedTrophyEl.textContent = "🎉";
    finishedHeadlineEl.textContent = "Quiz finished!";
  }

  playFanfare();
  if (window.confetti) {
    window.confetti({ particleCount: isWinner ? 140 : 70, spread: isWinner ? 100 : 70, origin: { y: 0.6 } });
  }
}

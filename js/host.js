import { supabase } from "./supabase-client.js";
import { renderQuestion, formatResponse, correctAnswerText } from "./question-types.js";
import { generateRoomCode, el, startCountdown } from "./utils.js";

const state = {
  session: null,
  quiz: null,
  questions: [],
  players: [],
  answersForCurrent: [],
  stopTimer: null,
  currentHandle: null,
};

const setupView = document.getElementById("setup-view");
const lobbyView = document.getElementById("lobby-view");
const questionView = document.getElementById("question-view");
const finishedView = document.getElementById("finished-view");

const quizSelect = document.getElementById("quiz-select");
const timeLimitSelect = document.getElementById("time-limit-select");
const startSessionBtn = document.getElementById("start-session-btn");
const roomCodeEl = document.getElementById("room-code");
const lobbyPlayerList = document.getElementById("lobby-player-list");
const startQuizBtn = document.getElementById("start-quiz-btn");

const questionContainer = document.getElementById("question-container");
const answerCountEl = document.getElementById("answer-count");
const timerEl = document.getElementById("timer");
const answerBreakdownEl = document.getElementById("answer-breakdown");
const revealBtn = document.getElementById("reveal-btn");
const nextBtn = document.getElementById("next-btn");
const scoreboardEl = document.getElementById("scoreboard");

const finalLeaderboard = document.getElementById("final-leaderboard");
const enablePracticeBtn = document.getElementById("enable-practice-btn");

function show(view) {
  [setupView, lobbyView, questionView, finishedView].forEach((v) => (v.style.display = "none"));
  view.style.display = "block";
}

// ---------- Setup: pick a quiz ----------

async function loadQuizzes() {
  const { data, error } = await supabase.from("quizzes").select("id, title").order("created_at");
  if (error) {
    quizSelect.innerHTML = `<option>Could not load quizzes (${error.message})</option>`;
    return;
  }
  quizSelect.innerHTML = data.map((q) => `<option value="${q.id}">${q.title}</option>`).join("");
}

function populateTimeLimitOptions() {
  const options = [`<option value="">Use each question's own time limit</option>`];
  for (let s = 1; s <= 60; s++) {
    options.push(`<option value="${s}"${s === 20 ? " selected" : ""}>${s} seconds</option>`);
  }
  timeLimitSelect.innerHTML = options.join("");
}

startSessionBtn.addEventListener("click", async () => {
  const quizId = quizSelect.value;
  if (!quizId) return;

  const code = generateRoomCode();
  const overrideSeconds = timeLimitSelect.value ? Number(timeLimitSelect.value) : null;
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ code, quiz_id: quizId, status: "lobby", current_question: 0, time_limit_seconds: overrideSeconds })
    .select()
    .single();

  if (error) {
    alert("Could not create session: " + error.message);
    return;
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");

  state.session = session;
  state.questions = questions || [];

  roomCodeEl.textContent = session.code;
  show(lobbyView);
  subscribeToSession();
  subscribeToPlayers();
});

// ---------- Lobby ----------

function renderLobbyPlayers() {
  lobbyPlayerList.innerHTML = "";
  state.players.forEach((p) => {
    const chip = el("div", "player-chip");
    chip.innerHTML = `<span class="avatar">${p.avatar}</span><span>${p.name}</span>`;
    lobbyPlayerList.appendChild(chip);
  });
  startQuizBtn.disabled = state.players.length === 0;
}

startQuizBtn.addEventListener("click", async () => {
  await supabase
    .from("sessions")
    .update({ status: "question", current_question: 0, question_started_at: new Date().toISOString() })
    .eq("id", state.session.id);
});

// ---------- Realtime subscriptions ----------

function subscribeToPlayers() {
  supabase
    .channel(`players:${state.session.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `session_id=eq.${state.session.id}` },
      async () => {
        const { data } = await supabase
          .from("players")
          .select("*")
          .eq("session_id", state.session.id)
          .order("joined_at");
        state.players = data || [];
        renderLobbyPlayers();
        renderScoreboard();
      }
    )
    .subscribe();
}

function subscribeToSession() {
  supabase
    .channel(`session:${state.session.id}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "sessions", filter: `id=eq.${state.session.id}` },
      (payload) => {
        state.session = payload.new;
        onSessionChange();
      }
    )
    .subscribe();

  supabase
    .channel(`answers:${state.session.id}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "answers", filter: `session_id=eq.${state.session.id}` },
      (payload) => {
        if (payload.new.question_id === currentQuestion()?.id) {
          state.answersForCurrent.push(payload.new);
          answerCountEl.textContent = `${state.answersForCurrent.length} / ${state.players.length} answered`;
        }
      }
    )
    .subscribe();
}

function currentQuestion() {
  return state.questions[state.session.current_question];
}

function effectiveTimeLimit() {
  return state.session.time_limit_seconds || currentQuestion().time_limit_seconds || 20;
}

function onSessionChange() {
  if (state.stopTimer) {
    state.stopTimer();
    state.stopTimer = null;
  }
  if (state.session.status === "question") {
    state.answersForCurrent = [];
    show(questionView);
    revealBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
    answerCountEl.textContent = `0 / ${state.players.length} answered`;
    answerBreakdownEl.innerHTML = "";
    state.currentHandle = renderQuestion(questionContainer, currentQuestion(), () => {}); // host doesn't answer, just displays
    disableHostQuestionInputs();
    renderScoreboard();
    state.stopTimer = startCountdown(timerEl, state.session.question_started_at, effectiveTimeLimit(), () => {
      supabase.from("sessions").update({ status: "reveal" }).eq("id", state.session.id);
    });
  } else if (state.session.status === "reveal") {
    timerEl.textContent = "--";
    revealBtn.style.display = "none";
    nextBtn.style.display = "inline-block";
    nextBtn.textContent =
      state.session.current_question + 1 < state.questions.length ? "Next question" : "Show final results";
    renderScoreboard();

    const question = currentQuestion();
    if (question.type === "mcq" && state.currentHandle) {
      state.currentHandle.showFeedback(null, false); // just highlights the correct option, no player response to mark wrong
    } else {
      const banner = document.createElement("div");
      banner.className = "feedback-banner";
      banner.style.background = "var(--surface-raised)";
      banner.style.border = "1px solid var(--border)";
      banner.textContent = `Correct answer: "${correctAnswerText(question)}"`;
      questionContainer.appendChild(banner);
    }

    answerBreakdownEl.innerHTML = "";
    state.players.forEach((p) => {
      const answer = state.answersForCurrent.find((a) => a.player_id === p.id);
      const chip = el("div", "player-chip " + (answer && answer.is_correct ? "correct" : "incorrect"));
      const responseText = answer ? formatResponse(question, answer.response) : "(no answer)";
      chip.innerHTML = `<span class="avatar">${p.avatar}</span><span>${p.name}: ${responseText}</span>`;
      answerBreakdownEl.appendChild(chip);
    });
  } else if (state.session.status === "finished") {
    show(finishedView);
    renderFinalLeaderboard();
  }
}

function disableHostQuestionInputs() {
  questionContainer.querySelectorAll("button, input").forEach((n) => (n.disabled = true));
}

revealBtn.addEventListener("click", async () => {
  await supabase.from("sessions").update({ status: "reveal" }).eq("id", state.session.id);
});

nextBtn.addEventListener("click", async () => {
  const next = state.session.current_question + 1;
  if (next >= state.questions.length) {
    await supabase.from("sessions").update({ status: "finished" }).eq("id", state.session.id);
  } else {
    await supabase
      .from("sessions")
      .update({ status: "question", current_question: next, question_started_at: new Date().toISOString() })
      .eq("id", state.session.id);
  }
});

function renderScoreboard() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  scoreboardEl.innerHTML = "";
  sorted.forEach((p) => {
    const chip = el("div", "player-chip");
    chip.innerHTML = `<span class="avatar">${p.avatar}</span><span>${p.name}</span><span class="score">${p.score}</span>`;
    scoreboardEl.appendChild(chip);
  });
}

function renderFinalLeaderboard() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  finalLeaderboard.innerHTML = sorted
    .map(
      (p, i) =>
        `<div class="player-chip"><span class="avatar">${p.avatar}</span><span>${i + 1}. ${p.name}</span><span class="score">${p.score}</span></div>`
    )
    .join("");
  enablePracticeBtn.disabled = false;
  enablePracticeBtn.textContent = "Make available for self-practice";
}

enablePracticeBtn.addEventListener("click", async () => {
  const { error } = await supabase
    .from("quizzes")
    .update({ available_for_practice: true })
    .eq("id", state.session.quiz_id);
  if (!error) {
    enablePracticeBtn.disabled = true;
    enablePracticeBtn.textContent = "Available for self-practice ✓";
  }
});

populateTimeLimitOptions();
loadQuizzes();

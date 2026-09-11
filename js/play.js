import { supabase } from "./supabase-client.js";
import { renderQuestion, gradeResponse } from "./question-types.js";
import { DEFAULT_AVATARS, MORE_AVATARS } from "./avatars.js";
import { el, startCountdown, generateRoomCode } from "./utils.js";
import { playFanfare } from "./sound.js";

const state = {
  session: null,
  accessCode: null,
  player: null,
  questions: [],
  currentHandle: null,
  currentResponse: null,
  currentElapsedMs: null,
  hasAnsweredCurrent: false,
  scoreAwardedForQuestion: false,
  stopTimer: null,
  celebrated: false,
  allPlayers: [],
  presentIds: new Set(),
  presenceChannel: null,
};

const joinView = document.getElementById("join-view");
const waitingView = document.getElementById("waiting-view");
const questionView = document.getElementById("question-view");
const finishedView = document.getElementById("finished-view");

const codeInput = document.getElementById("code-input");
const nameInput = document.getElementById("name-input");
const avatarPicker = document.getElementById("avatar-picker");
const avatarPickerMore = document.getElementById("avatar-picker-more");
const joinBtn = document.getElementById("join-btn");
const joinError = document.getElementById("join-error");
const reconnectInput = document.getElementById("reconnect-input");
const reconnectBtn = document.getElementById("reconnect-btn");
const reconnectError = document.getElementById("reconnect-error");

const otherPlayersEl = document.getElementById("other-players");
const playersRosterEl = document.getElementById("players-roster");
const questionContainer = document.getElementById("question-container");
const timerEl = document.getElementById("timer");
const questionProgressEl = document.getElementById("question-progress");
const myScoreEl = document.getElementById("my-score");
const finalScoreEl = document.getElementById("final-score");
const finalRankEl = document.getElementById("final-rank");
const finishedHeadlineEl = document.getElementById("finished-headline");
const finishedTrophyEl = document.getElementById("finished-trophy");
const finishedMessageEl = document.getElementById("finished-message");
const practiceLinkEl = document.getElementById("practice-link");
const myReturnCodeEl = document.getElementById("my-return-code");

let selectedAvatar = DEFAULT_AVATARS[0];

function show(view) {
  [joinView, waitingView, questionView, finishedView].forEach((v) => (v.style.display = "none"));
  view.style.display = "block";
}

function showMyReturnCode(player) {
  if (!player.return_code) return;
  myReturnCodeEl.textContent = `Your return code (save this in case you get disconnected): ${player.return_code}`;
  myReturnCodeEl.style.display = "block";
}

// ---------- Avatar picker ----------

function addAvatarTile(container, a) {
  const btn = el("button", "tile", a);
  btn.type = "button";
  btn.addEventListener("click", () => {
    selectedAvatar = a;
    document.querySelectorAll("#avatar-picker .tile, #avatar-picker-more .tile").forEach((t) => t.classList.remove("selected"));
    btn.classList.add("selected");
  });
  container.appendChild(btn);
  return btn;
}

DEFAULT_AVATARS.forEach((a) => addAvatarTile(avatarPicker, a));
MORE_AVATARS.forEach((a) => addAvatarTile(avatarPickerMore, a));
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

  const { data: quiz, error: quizErr } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("access_code", code)
    .single();
  if (quizErr || !quiz) {
    joinError.textContent = "No quiz found with that code.";
    joinError.style.display = "block";
    return;
  }

  const { data: session, error: sessErr } = await supabase
    .from("sessions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .in("status", ["lobby", "question", "reveal"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (sessErr || !session) {
    joinError.textContent = "No live game is running for this quiz right now — ask your teacher to start it.";
    joinError.style.display = "block";
    return;
  }

  const { data: player, error: joinErr } = await supabase
    .from("players")
    .insert({ session_id: session.id, name, avatar: selectedAvatar, return_code: generateRoomCode() })
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
  state.accessCode = code;
  state.player = player;
  state.questions = questions || [];
  showMyReturnCode(player);

  subscribeToSession();
  subscribeToOtherPlayers();
  subscribeToPresence();

  if (session.status === "lobby") {
    show(waitingView);
  } else {
    onSessionChange();
  }
});

// ---------- Reconnect (after a disconnect) ----------

reconnectBtn.addEventListener("click", async () => {
  reconnectError.style.display = "none";
  const returnCode = reconnectInput.value.trim().toUpperCase();
  if (!returnCode) {
    reconnectError.textContent = "Enter your return code.";
    reconnectError.style.display = "block";
    return;
  }

  const { data: player, error: playerErr } = await supabase
    .from("players")
    .select("*, sessions:session_id(*)")
    .eq("return_code", returnCode)
    .single();
  if (playerErr || !player || !player.sessions) {
    reconnectError.textContent = "No player found with that code.";
    reconnectError.style.display = "block";
    return;
  }
  const session = player.sessions;
  if (session.status === "finished") {
    reconnectError.textContent = "That game has already finished.";
    reconnectError.style.display = "block";
    return;
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", session.quiz_id)
    .order("position");

  const { data: quiz } = await supabase.from("quizzes").select("access_code").eq("id", session.quiz_id).single();

  delete player.sessions;
  state.session = session;
  state.accessCode = quiz ? quiz.access_code : "";
  state.player = player;
  state.questions = questions || [];
  showMyReturnCode(player);

  subscribeToSession();
  subscribeToOtherPlayers();
  subscribeToPresence();

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

async function refreshPlayers() {
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", state.session.id)
    .order("joined_at");
  state.allPlayers = data || [];
  renderPlayerDisplays();
  syncMyScore(state.allPlayers);
}

function subscribeToOtherPlayers() {
  const channel = supabase
    .channel(`play-players:${state.session.id}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `session_id=eq.${state.session.id}` },
      () => refreshPlayers()
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") refreshPlayers(); // don't wait for the first change event - fetch now
    });
}

// Tracks who's actively connected (tab open). Lets everyone's roster reflect
// players who've dropped out, without needing them to explicitly "leave."
function subscribeToPresence() {
  const presenceChannel = supabase.channel(`presence:${state.session.id}`, {
    config: { presence: { key: state.player.id } },
  });
  presenceChannel
    .on("presence", { event: "sync" }, () => {
      state.presentIds = new Set(Object.keys(presenceChannel.presenceState()));
      renderPlayerDisplays();
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({ name: state.player.name, avatar: state.player.avatar });
      }
    });
  state.presenceChannel = presenceChannel;

  // Presence's own disconnect detection can take up to a minute (heartbeat
  // based). Explicitly untracking on tab close/hide makes the host and
  // other players see a departure within a second or two instead.
  const announceLeaving = () => {
    try {
      presenceChannel.untrack();
    } catch {
      /* best effort - the tab is closing anyway */
    }
  };
  window.addEventListener("pagehide", announceLeaving);
  window.addEventListener("beforeunload", announceLeaving);
}

function renderPlayerDisplays() {
  const visible = state.allPlayers.filter((p) => state.presentIds.size === 0 || state.presentIds.has(p.id));

  otherPlayersEl.innerHTML = "";
  visible.forEach((p) => {
    const chip = el("div", "player-chip");
    chip.innerHTML = `<span class="avatar">${p.avatar}</span><span>${p.name}</span>`;
    otherPlayersEl.appendChild(chip);
  });

  playersRosterEl.innerHTML = "";
  visible.forEach((p) => {
    const isMe = state.player && p.id === state.player.id;
    const avatarEl = document.createElement("span");
    avatarEl.className = "roster-avatar" + (isMe ? " is-me" : "");
    avatarEl.textContent = p.avatar;
    const label = isMe ? `${p.name} (you)` : p.name;
    avatarEl.title = label; // desktop hover
    avatarEl.tabIndex = 0;
    avatarEl.addEventListener("click", () => showAvatarLabel(avatarEl, label)); // works on tap too
    playersRosterEl.appendChild(avatarEl);
  });
}

let labelTimeout = null;
function showAvatarLabel(avatarEl, text) {
  document.querySelectorAll(".roster-label").forEach((n) => n.remove());
  const label = document.createElement("div");
  label.className = "roster-label";
  label.textContent = text;
  avatarEl.appendChild(label);
  clearTimeout(labelTimeout);
  labelTimeout = setTimeout(() => label.remove(), 2000);
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
    state.currentElapsedMs = null;
    state.scoreAwardedForQuestion = false;
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
      awardPointsIfDue(correct);
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
  const startedAt = new Date(state.session.question_started_at).getTime();
  const elapsedMs = Math.max(0, Date.now() - startedAt);
  state.currentElapsedMs = elapsedMs;

  await supabase.from("answers").insert({
    session_id: state.session.id,
    player_id: state.player.id,
    question_id: question.id,
    response,
    is_correct: correct,
    time_taken_ms: elapsedMs,
  });
  // Points are awarded once the host reveals the answer, not here - see
  // awardPointsIfDue, called from the "reveal" branch of onSessionChange.
}

// Called when the host reveals the answer. Only awards points once per
// question, and only for a locally-submitted correct answer with a known
// elapsed time (a reconnecting player who missed the question entirely
// has neither, so nothing is awarded).
async function awardPointsIfDue(correct) {
  if (state.scoreAwardedForQuestion) return;
  if (!correct || !state.hasAnsweredCurrent || state.currentElapsedMs == null) return;
  state.scoreAwardedForQuestion = true;

  const question = currentQuestion();
  const basePoints = question.points || 100;
  const tensOfSecondsElapsed = Math.floor(state.currentElapsedMs / 1000 / 10);
  const awarded = Math.max(basePoints - tensOfSecondsElapsed * 10, 10);
  const newScore = state.player.score + awarded;
  await supabase.from("players").update({ score: newScore }).eq("id", state.player.id);
}

function resultMessage(correctCount, total) {
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  let line;
  if (pct >= 90) line = "Outstanding work!";
  else if (pct >= 70) line = "Great job!";
  else if (pct >= 50) line = "Nice effort!";
  else line = "Keep practicing — you'll get there!";
  return `You got ${correctCount} out of ${total} questions right (${pct}%). ${line}`;
}

async function showFinalResult() {
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", state.session.id)
    .order("score", { ascending: false });
  const list = players || [];
  const me = list.find((p) => p.id === state.player.id);
  const rank = list.findIndex((p) => p.id === state.player.id) + 1;
  finalScoreEl.textContent = me ? me.score : state.player.score;
  finalRankEl.textContent = rank ? `${rank} / ${list.length}` : "";
  practiceLinkEl.href = `practice.html?code=${state.accessCode}`;

  const { data: myAnswers } = await supabase
    .from("answers")
    .select("is_correct")
    .eq("session_id", state.session.id)
    .eq("player_id", state.player.id);
  const correctCount = (myAnswers || []).filter((a) => a.is_correct).length;
  finishedMessageEl.textContent = resultMessage(correctCount, state.questions.length);

  const isWinner = rank === 1 && me && me.score > 0;

  if (state.session.ended_early) {
    finishedTrophyEl.textContent = "⏹️";
    finishedHeadlineEl.textContent = "The host ended the quiz early";
  } else if (isWinner) {
    finishedTrophyEl.textContent = "🏆";
    finishedHeadlineEl.textContent = "You won! 🎉";
  } else {
    finishedTrophyEl.textContent = "🎉";
    finishedHeadlineEl.textContent = "Quiz finished!";
  }

  if (!state.session.ended_early) {
    playFanfare();
    if (window.confetti) {
      window.confetti({ particleCount: isWinner ? 140 : 70, spread: isWinner ? 100 : 70, origin: { y: 0.6 } });
    }
  }
}

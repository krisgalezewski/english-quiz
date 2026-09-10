import { supabase } from "./supabase-client.js";
import { renderQuestion, formatResponse, correctAnswerText } from "./question-types.js";
import { generateRoomCode, el, startCountdown } from "./utils.js";
import { playDing, playFanfare } from "./sound.js";

const state = {
  session: null,
  accessCode: null,
  questions: [],
  players: [],
  presentIds: new Set(),
  answersForCurrent: [],
  stopTimer: null,
  currentHandle: null,
  practiceEnabled: false,
  soundPlayedForQuestion: false,
  celebrated: false,
  allQuizzes: [],
  sortMode: "chronological", // "chronological" | "alphabetical"
  activeQuizId: null,
};

const setupView = document.getElementById("setup-view");
const lobbyView = document.getElementById("lobby-view");
const questionView = document.getElementById("question-view");
const finishedView = document.getElementById("finished-view");

const quizSelect = document.getElementById("quiz-select");
const sortToggleBtn = document.getElementById("sort-toggle-btn");
const timeLimitSelect = document.getElementById("time-limit-select");
const startSessionBtn = document.getElementById("start-session-btn");
const roomCodeEl = document.getElementById("room-code");
const lobbyPlayerList = document.getElementById("lobby-player-list");
const startQuizBtn = document.getElementById("start-quiz-btn");
const endQuizBtnLobby = document.getElementById("end-quiz-btn-lobby");
const endQuizBtn = document.getElementById("end-quiz-btn");
const manageQuizzesEl = document.getElementById("manage-quizzes");
const hostNoticeEl = document.getElementById("host-notice");

const questionContainer = document.getElementById("question-container");
const answerCountEl = document.getElementById("answer-count");
const timerEl = document.getElementById("timer");
const questionProgressEl = document.getElementById("question-progress");
const answerBreakdownEl = document.getElementById("answer-breakdown");
const revealBtn = document.getElementById("reveal-btn");
const nextBtn = document.getElementById("next-btn");
const scoreboardEl = document.getElementById("scoreboard");

const finalLeaderboard = document.getElementById("final-leaderboard");
const gameStatsEl = document.getElementById("game-stats");
const enablePracticeBtn = document.getElementById("enable-practice-btn");
const soundToggleSetup = document.getElementById("sound-toggle");
const soundToggleGame = document.getElementById("sound-toggle-game");
const winnerNameEl = document.getElementById("winner-name");
const finishedRoomCodeEl = document.getElementById("finished-room-code");

function show(view) {
  [setupView, lobbyView, questionView, finishedView].forEach((v) => (v.style.display = "none"));
  view.style.display = "block";
}

function showNotice(text) {
  hostNoticeEl.textContent = text;
  hostNoticeEl.style.display = "block";
  // restart the fade animation
  hostNoticeEl.style.animation = "none";
  void hostNoticeEl.offsetWidth;
  hostNoticeEl.style.animation = "";
  setTimeout(() => (hostNoticeEl.style.display = "none"), 4000);
}

// Two sound checkboxes (setup screen + in-game) stay in sync with each other.
function isSoundEnabled() {
  return soundToggleSetup.checked;
}
soundToggleSetup.addEventListener("change", () => {
  soundToggleGame.checked = soundToggleSetup.checked;
});
soundToggleGame.addEventListener("change", () => {
  soundToggleSetup.checked = soundToggleGame.checked;
});

// ---------- Setup: pick a quiz ----------

async function loadQuizzes() {
  const { data, error } = await supabase.from("quizzes").select("id, title, created_at").order("created_at");
  if (error) {
    quizSelect.innerHTML = `<option>Could not load quizzes (${error.message})</option>`;
    return;
  }
  state.allQuizzes = data;
  renderQuizSelectOptions();
}

function renderQuizSelectOptions() {
  const previousValue = quizSelect.value;
  const sorted = [...state.allQuizzes].sort((a, b) => {
    if (state.sortMode === "alphabetical") return a.title.localeCompare(b.title);
    return new Date(b.created_at) - new Date(a.created_at); // newest first
  });
  quizSelect.innerHTML = sorted.map((q) => `<option value="${q.id}">${q.title}</option>`).join("");
  if (sorted.some((q) => q.id === previousValue)) quizSelect.value = previousValue;
  sortToggleBtn.textContent = state.sortMode === "alphabetical" ? "Sort: A–Z" : "Sort: Newest";
}

sortToggleBtn.addEventListener("click", () => {
  state.sortMode = state.sortMode === "alphabetical" ? "chronological" : "alphabetical";
  renderQuizSelectOptions();
});

function populateTimeLimitOptions() {
  const options = [`<option value="">Use each question's own time limit</option>`];
  for (let s = 1; s <= 60; s++) {
    options.push(`<option value="${s}"${s === 20 ? " selected" : ""}>${s} seconds</option>`);
  }
  timeLimitSelect.innerHTML = options.join("");
}

// ---------- Manage quizzes: public/private toggle + persistent codes ----------

async function ensureAccessCode(quiz) {
  if (quiz.access_code) return quiz.access_code;
  const code = generateRoomCode();
  await supabase.from("quizzes").update({ access_code: code }).eq("id", quiz.id);
  return code;
}

async function loadManageQuizzes() {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, access_code, available_for_practice")
    .order("created_at");
  if (error || !data) return;

  for (const q of data) {
    if (!q.access_code) q.access_code = await ensureAccessCode(q);
  }

  manageQuizzesEl.innerHTML = "";
  data.forEach((q) => {
    const row = el("div", "quiz-row" + (q.id === state.activeQuizId ? " active-quiz" : ""));
    row.innerHTML = `
      <span class="title">${q.title}${q.id === state.activeQuizId ? ' <span class="eyebrow">— in play now</span>' : ""}</span>
      <span class="code-badge" ${q.available_for_practice ? 'style="display:none"' : ""}>
        ${q.access_code}
        <button type="button" class="btn btn-outline copy-btn" data-copy="${q.access_code}">Copy</button>
      </span>
      <label class="toggle-label">
        <input type="checkbox" data-quiz-id="${q.id}" ${q.available_for_practice ? "checked" : ""} />
        Public
      </label>
    `;
    manageQuizzesEl.appendChild(row);
  });

  manageQuizzesEl.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.addEventListener("change", async (e) => {
      await supabase
        .from("quizzes")
        .update({ available_for_practice: e.target.checked })
        .eq("id", e.target.dataset.quizId);
      loadManageQuizzes();
    });
  });

  manageQuizzesEl.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const original = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(() => (btn.textContent = original), 1200);
      } catch (e) {
        alert("Code: " + btn.dataset.copy);
      }
    });
  });
}

startSessionBtn.addEventListener("click", async () => {
  const quizId = quizSelect.value;
  if (!quizId) return;

  const { data: quiz } = await supabase.from("quizzes").select("id, access_code").eq("id", quizId).single();
  const accessCode = await ensureAccessCode(quiz);

  const overrideSeconds = timeLimitSelect.value ? Number(timeLimitSelect.value) : null;
  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ quiz_id: quizId, status: "lobby", current_question: 0, time_limit_seconds: overrideSeconds })
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
  state.accessCode = accessCode;
  state.questions = questions || [];
  state.activeQuizId = quizId;
  loadManageQuizzes();

  roomCodeEl.textContent = accessCode;
  show(lobbyView);
  subscribeToSession();
  subscribeToPlayers();
  subscribeToPresence();
});

// ---------- Lobby ----------

function renderLobbyPlayers() {
  lobbyPlayerList.innerHTML = "";
  state.players.forEach((p) => {
    const isPresent = state.presentIds.size === 0 || state.presentIds.has(p.id);
    lobbyPlayerList.appendChild(playerChip(p, { isPresent }));
  });
  startQuizBtn.disabled = state.players.filter((p) => state.presentIds.size === 0 || state.presentIds.has(p.id)).length === 0;
}

// One player chip, reused everywhere in the host view. Always includes a
// small return-code button - we don't rely on presence detection (which
// can take up to a minute to notice a closed tab) to decide whether the
// code is available; it's just always there.
function playerChip(p, { isPresent, showScore = false } = {}) {
  const chip = el("div", "player-chip" + (isPresent ? "" : " is-left"));
  chip.innerHTML = `
    <span class="avatar">${p.avatar}</span>
    <span>${p.name}${isPresent ? "" : " (left)"}</span>
    ${showScore ? `<span class="score">${p.score}</span>` : ""}
    <button type="button" class="btn btn-outline code-btn" data-code="${p.return_code || ""}" title="Get this player's return code">🔑</button>
  `;
  chip.querySelector(".code-btn").addEventListener("click", async (e) => {
    e.stopPropagation();
    const code = e.currentTarget.dataset.code;
    if (!code) {
      alert(`${p.name} doesn't have a return code yet (they may have joined before this feature was added).`);
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      showNotice(`Copied ${p.name}'s return code: ${code}`);
    } catch {
      alert(`${p.name}'s return code: ${code}`);
    }
  });
  return chip;
}

startQuizBtn.addEventListener("click", async () => {
  await supabase
    .from("sessions")
    .update({ status: "question", current_question: 0, question_started_at: new Date().toISOString() })
    .eq("id", state.session.id);
});

async function endQuiz() {
  if (!confirm("End this quiz now? Players will see the game finished early.")) return;
  const { error } = await supabase
    .from("sessions")
    .update({ status: "finished", ended_early: true })
    .eq("id", state.session.id);
  if (error) {
    alert(
      "Could not end the quiz: " +
        error.message +
        "\n\nIf this mentions 'ended_early', you likely need to run migration-006-ended-early.sql in Supabase."
    );
  }
}
endQuizBtnLobby.addEventListener("click", endQuiz);
endQuizBtn.addEventListener("click", endQuiz);

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

// Tracks who's actively connected (tab open), so we can show a notice and
// visually mark players who drop out mid-game. Host doesn't "track" itself
// here - it just listens.
function subscribeToPresence() {
  const presenceChannel = supabase.channel(`presence:${state.session.id}`, {
    config: { presence: { key: "host-observer" } },
  });
  presenceChannel
    .on("presence", { event: "sync" }, () => {
      const presenceState = presenceChannel.presenceState();
      state.presentIds = new Set(Object.keys(presenceState).filter((k) => k !== "host-observer"));
      renderLobbyPlayers();
      renderScoreboard();
      maybePlayAllAnsweredSound();
    })
    .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
      if (key === "host-observer") return;
      const info = leftPresences && leftPresences[0];
      if (info) showNotice(`${info.avatar || ""} ${info.name || "A player"} left the game.`.trim());
    })
    .subscribe();
}

function maybePlayAllAnsweredSound() {
  if (state.session?.status !== "question") return;
  const total = presentPlayers().length;
  answerCountEl.textContent = `${state.answersForCurrent.length}/${total}`;
  if (isSoundEnabled() && !state.soundPlayedForQuestion && total > 0 && state.answersForCurrent.length >= total) {
    state.soundPlayedForQuestion = true;
    playDing();
  }
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
          maybePlayAllAnsweredSound();
        }
      }
    )
    .subscribe();
}

function currentQuestion() {
  return state.questions[state.session.current_question];
}

function presentPlayers() {
  return state.players.filter((p) => state.presentIds.size === 0 || state.presentIds.has(p.id));
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
    state.soundPlayedForQuestion = false;
    show(questionView);
    revealBtn.style.display = "inline-block";
    nextBtn.style.display = "none";
    answerCountEl.textContent = `0/${presentPlayers().length}`;
    answerBreakdownEl.innerHTML = "";
    questionProgressEl.textContent = `${state.session.current_question + 1}/${state.questions.length}`;
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
      const isPresent = state.presentIds.size === 0 || state.presentIds.has(p.id);
      const chip = el(
        "div",
        "player-chip " + (answer && answer.is_correct ? "correct" : "incorrect") + (isPresent ? "" : " is-left")
      );
      const responseText = answer ? formatResponse(question, answer.response) : "(no answer)";
      chip.innerHTML = `<span class="avatar">${p.avatar}</span><span>${p.name}${isPresent ? "" : " (left)"}: ${responseText}</span>`;
      answerBreakdownEl.appendChild(chip);
    });
  } else if (state.session.status === "finished") {
    show(finishedView);
    renderFinalLeaderboard();
    syncPracticeButton();
    renderGameStats();
    finishedRoomCodeEl.textContent = state.accessCode;
    if (!state.celebrated) {
      state.celebrated = true;
      celebrate();
    }
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
    const isPresent = state.presentIds.size === 0 || state.presentIds.has(p.id);
    scoreboardEl.appendChild(playerChip(p, { isPresent, showScore: true }));
  });
}

function renderFinalLeaderboard() {
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  finalLeaderboard.innerHTML = sorted
    .map(
      (p, i) =>
        `<div class="player-chip${i === 0 && p.score > 0 ? " is-winner" : ""}"><span class="avatar">${p.avatar}</span><span>${i + 1}. ${p.name}</span><span class="score">${p.score}</span></div>`
    )
    .join("");
  winnerNameEl.textContent = sorted.length && sorted[0].score > 0 ? `${sorted[0].avatar} ${sorted[0].name} wins!` : "Great game!";
}

function celebrate() {
  playFanfare();
  if (window.confetti) {
    window.confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    setTimeout(() => window.confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 } }), 300);
  }
}

// ---------- End-of-game stats (computed fresh, never saved) ----------

async function renderGameStats() {
  gameStatsEl.innerHTML = `<div class="stat-row"><span class="stat-label">Loading stats…</span></div>`;

  const { data: answers } = await supabase.from("answers").select("*").eq("session_id", state.session.id);
  if (!answers || answers.length === 0 || state.questions.length === 0) {
    gameStatsEl.innerHTML = "";
    return;
  }

  const playerById = Object.fromEntries(state.players.map((p) => [p.id, p]));

  const perQuestion = state.questions.map((q) => {
    const qAnswers = answers.filter((a) => a.question_id === q.id);
    const correct = qAnswers.filter((a) => a.is_correct);
    const avgCorrectTime = correct.length
      ? correct.reduce((sum, a) => sum + (a.time_taken_ms || 0), 0) / correct.length
      : null;
    const avgTime = qAnswers.length
      ? qAnswers.reduce((sum, a) => sum + (a.time_taken_ms || 0), 0) / qAnswers.length
      : 0;
    return { question: q, total: qAnswers.length, correctCount: correct.length, avgCorrectTime, avgTime };
  });

  // Top question: everyone who answered got it right, fastest average time among those.
  const perfectQuestions = perQuestion.filter((pq) => pq.total > 0 && pq.correctCount === pq.total);
  let topQuestion = null;
  if (perfectQuestions.length) {
    topQuestion = perfectQuestions.reduce((best, pq) => (pq.avgCorrectTime < best.avgCorrectTime ? pq : best));
  } else {
    const answered = perQuestion.filter((pq) => pq.total > 0);
    if (answered.length) {
      topQuestion = answered.reduce((best, pq) => {
        const bestRate = best.correctCount / best.total;
        const rate = pq.correctCount / pq.total;
        return rate > bestRate ? pq : best;
      });
    }
  }

  // Weakest question: nobody got it right > most people got it wrong > took longest on average.
  const zeroCorrect = perQuestion.filter((pq) => pq.total > 0 && pq.correctCount === 0);
  let weakQuestion = null;
  if (zeroCorrect.length) {
    weakQuestion = zeroCorrect.reduce((worst, pq) => (pq.total > worst.total ? pq : worst));
  } else {
    const answered = perQuestion.filter((pq) => pq.total > 0);
    const anyWrong = answered.filter((pq) => pq.correctCount < pq.total);
    if (anyWrong.length) {
      weakQuestion = anyWrong.reduce((worst, pq) => (pq.total - pq.correctCount > worst.total - worst.correctCount ? pq : worst));
    } else if (answered.length) {
      weakQuestion = answered.reduce((worst, pq) => (pq.avgTime > worst.avgTime ? pq : worst));
    }
  }

  // Quickest single correct answer of the game.
  const correctAnswers = answers.filter((a) => a.is_correct && a.time_taken_ms != null);
  const quickest = correctAnswers.length
    ? correctAnswers.reduce((best, a) => (a.time_taken_ms < best.time_taken_ms ? a : best))
    : null;

  // Most accurate player.
  const byPlayer = {};
  answers.forEach((a) => {
    if (!byPlayer[a.player_id]) byPlayer[a.player_id] = { correct: 0, total: 0, timeSum: 0, timeCount: 0 };
    byPlayer[a.player_id].total += 1;
    if (a.is_correct) byPlayer[a.player_id].correct += 1;
    if (a.is_correct && a.time_taken_ms != null) {
      byPlayer[a.player_id].timeSum += a.time_taken_ms;
      byPlayer[a.player_id].timeCount += 1;
    }
  });
  let mostAccurate = null;
  let fastestAvg = null;
  Object.entries(byPlayer).forEach(([playerId, stats]) => {
    const player = playerById[playerId];
    if (!player) return;
    const accuracy = stats.correct / stats.total;
    if (!mostAccurate || accuracy > mostAccurate.accuracy) mostAccurate = { player, accuracy };
    if (stats.timeCount > 0) {
      const avg = stats.timeSum / stats.timeCount;
      if (!fastestAvg || avg < fastestAvg.avg) fastestAvg = { player, avg };
    }
  });
  const perfectScorers = Object.entries(byPlayer)
    .filter(([, s]) => s.total === state.questions.length && s.correct === s.total)
    .map(([playerId]) => playerById[playerId])
    .filter(Boolean);

  const rows = [];
  if (topQuestion) {
    rows.push([
      "🏆 Top question",
      `Q${questionNumber(topQuestion.question)}: "${truncate(topQuestion.question.prompt)}" — ${topQuestion.correctCount}/${topQuestion.total} correct`,
    ]);
  }
  if (weakQuestion) {
    rows.push([
      "🧩 Toughest question",
      `Q${questionNumber(weakQuestion.question)}: "${truncate(weakQuestion.question.prompt)}" — only ${weakQuestion.correctCount}/${weakQuestion.total} correct`,
    ]);
  }
  if (quickest) {
    const p = playerById[quickest.player_id];
    const q = state.questions.find((qq) => qq.id === quickest.question_id);
    rows.push([
      "⚡ Quickest answer",
      `${p ? p.avatar + " " + p.name : "Someone"} in ${(quickest.time_taken_ms / 1000).toFixed(1)}s${
        q ? ` — Q${questionNumber(q)}: "${truncate(q.prompt)}"` : ""
      }`,
    ]);
  }
  if (mostAccurate) {
    rows.push([
      "🎯 Most accurate",
      `${mostAccurate.player.avatar} ${mostAccurate.player.name} — ${Math.round(mostAccurate.accuracy * 100)}% correct`,
    ]);
  }
  if (fastestAvg) {
    rows.push([
      "🚀 Fastest average response",
      `${fastestAvg.player.avatar} ${fastestAvg.player.name} — ${(fastestAvg.avg / 1000).toFixed(1)}s on average`,
    ]);
  }
  if (perfectScorers.length) {
    rows.push(["💯 Perfect score", perfectScorers.map((p) => `${p.avatar} ${p.name}`).join(", ")]);
  }

  gameStatsEl.innerHTML = rows
    .map(([label, value]) => `<div class="stat-row"><div class="stat-label">${label}</div><div class="stat-value" style="text-transform:none;font-family:var(--font-body);font-weight:500">${value}</div></div>`)
    .join("");
}

function truncate(text, max = 60) {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

function questionNumber(question) {
  return state.questions.findIndex((q) => q.id === question.id) + 1;
}

async function syncPracticeButton() {
  const { data } = await supabase
    .from("quizzes")
    .select("available_for_practice")
    .eq("id", state.session.quiz_id)
    .single();
  state.practiceEnabled = !!(data && data.available_for_practice);
  updatePracticeButtonLabel();
}

function updatePracticeButtonLabel() {
  enablePracticeBtn.textContent = state.practiceEnabled
    ? "✓ In the public self-practice list (click to remove)"
    : "Also add to the public self-practice list";
}

enablePracticeBtn.addEventListener("click", async () => {
  const newValue = !state.practiceEnabled;
  const { error } = await supabase
    .from("quizzes")
    .update({ available_for_practice: newValue })
    .eq("id", state.session.quiz_id);
  if (!error) {
    state.practiceEnabled = newValue;
    updatePracticeButtonLabel();
    loadManageQuizzes();
  }
});

populateTimeLimitOptions();
loadQuizzes();
loadManageQuizzes();

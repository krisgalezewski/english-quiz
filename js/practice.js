import { supabase } from "./supabase-client.js";
import { renderQuestion, gradeResponse } from "./question-types.js";
import { getParam } from "./utils.js";

const state = {
  title: "",
  questions: [],
  index: 0,
  score: 0,
  answered: false,
};

const introView = document.getElementById("intro-view");
const confirmView = document.getElementById("confirm-view");
const quizView = document.getElementById("quiz-view");
const doneView = document.getElementById("done-view");

const quizSelect = document.getElementById("quiz-select");
const startBtn = document.getElementById("start-btn");
const codeInput = document.getElementById("code-input");
const codeStartBtn = document.getElementById("code-start-btn");
const codeError = document.getElementById("code-error");

const confirmTitleEl = document.getElementById("confirm-title");
const confirmDescEl = document.getElementById("confirm-desc");
const confirmStartBtn = document.getElementById("confirm-start-btn");

const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("running-score");
const questionContainer = document.getElementById("question-container");
const nextBtn = document.getElementById("next-btn");

const finalScoreEl = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");

function show(view) {
  [introView, confirmView, quizView, doneView].forEach((v) => (v.style.display = "none"));
  view.style.display = "block";
}

async function loadQuizList() {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, description")
    .eq("available_for_practice", true)
    .order("created_at");
  if (error || !data || data.length === 0) {
    quizSelect.innerHTML = `<option value="">No quizzes available for practice yet</option>`;
    startBtn.disabled = true;
    return;
  }
  quizSelect.innerHTML = data.map((q) => `<option value="${q.id}">${q.title}</option>`).join("");
  startBtn.disabled = false;

  // Arriving via practice.html?quiz=<id> (a grid tile or the "Quiz of the
  // day" link) — don't launch straight into question 1. Show a named
  // confirmation instead, with an explicit "Start the quiz" button, same
  // as picking a quiz from the dropdown already requires a "Start" click.
  const preselect = getParam("quiz");
  if (preselect && data.some((q) => q.id === preselect)) {
    const picked = data.find((q) => q.id === preselect);
    quizSelect.value = preselect;
    confirmTitleEl.textContent = picked.title;
    confirmDescEl.textContent = picked.description || "";
    show(confirmView);
    confirmStartBtn.onclick = async () => {
      await loadQuestions(preselect);
      beginQuiz();
    };
  }
}

async function loadQuestions(quizId) {
  const { data: quiz } = await supabase.from("quizzes").select("title").eq("id", quizId).single();
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");
  state.title = quiz?.title || "Quiz";
  state.questions = questions || [];
}

async function startWithCode(code) {
  codeError.style.display = "none";
  if (!code) {
    codeError.textContent = "Enter a room code.";
    codeError.style.display = "block";
    return;
  }
  const { data: quiz, error } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("access_code", code.trim().toUpperCase())
    .single();
  if (error || !quiz) {
    codeError.textContent = "No quiz found with that code.";
    codeError.style.display = "block";
    return;
  }
  const { data: playedSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("quiz_id", quiz.id)
    .eq("status", "finished")
    .limit(1)
    .maybeSingle();
  if (!playedSession) {
    codeError.textContent = "This quiz hasn't been played live yet — ask your teacher to finish the live session first.";
    codeError.style.display = "block";
    return;
  }
  await loadQuestions(quiz.id);
  beginQuiz();
}

codeStartBtn.addEventListener("click", () => startWithCode(codeInput.value));
codeInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") startWithCode(codeInput.value);
});

function beginQuiz() {
  state.index = 0;
  state.score = 0;
  if (state.questions.length === 0) {
    alert("This quiz has no questions yet.");
    return;
  }
  show(quizView);
  renderCurrent();
}

startBtn.addEventListener("click", async () => {
  await loadQuestions(quizSelect.value);
  beginQuiz();
});

function renderCurrent() {
  state.answered = false;
  nextBtn.style.display = "none";
  const question = state.questions[state.index];
  progressEl.textContent = `${state.index + 1}/${state.questions.length}`;
  scoreEl.textContent = state.score;

  const handle = renderQuestion(questionContainer, question, (response) => {
    if (state.answered) return;
    state.answered = true;
    const correct = gradeResponse(question, response);
    if (correct) state.score += question.points || 100;
    scoreEl.textContent = state.score;
    handle.showFeedback(response, correct);
    nextBtn.style.display = "inline-block";
    nextBtn.textContent = state.index + 1 < state.questions.length ? "Next question" : "Finish";
  });
}

nextBtn.addEventListener("click", () => {
  state.index += 1;
  if (state.index >= state.questions.length) {
    show(doneView);
    finalScoreEl.textContent = state.score;
  } else {
    renderCurrent();
  }
});

retryBtn.addEventListener("click", () => {
  show(introView);
});

loadQuizList();

const codeFromLink = getParam("code");
if (codeFromLink) {
  codeInput.value = codeFromLink;
  startWithCode(codeFromLink);
}

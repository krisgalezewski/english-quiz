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
const quizView = document.getElementById("quiz-view");
const doneView = document.getElementById("done-view");

const quizSelect = document.getElementById("quiz-select");
const startBtn = document.getElementById("start-btn");

const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("running-score");
const questionContainer = document.getElementById("question-container");
const nextBtn = document.getElementById("next-btn");

const finalScoreEl = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");

function show(view) {
  [introView, quizView, doneView].forEach((v) => (v.style.display = "none"));
  view.style.display = "block";
}

async function loadQuizList() {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("available_for_practice", true)
    .order("created_at");
  if (error || !data || data.length === 0) {
    quizSelect.innerHTML = `<option value="">No quizzes available for practice yet</option>`;
    startBtn.disabled = true;
    return;
  }
  quizSelect.innerHTML = data.map((q) => `<option value="${q.id}">${q.title}</option>`).join("");
  startBtn.disabled = false;

  const preselect = getParam("quiz");
  if (preselect) quizSelect.value = preselect;
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

startBtn.addEventListener("click", async () => {
  await loadQuestions(quizSelect.value);
  state.index = 0;
  state.score = 0;
  if (state.questions.length === 0) {
    alert("This quiz has no questions yet.");
    return;
  }
  show(quizView);
  renderCurrent();
});

function renderCurrent() {
  state.answered = false;
  nextBtn.style.display = "none";
  const question = state.questions[state.index];
  progressEl.textContent = `Question ${state.index + 1} / ${state.questions.length}`;
  scoreEl.textContent = `Score: ${state.score}`;

  const handle = renderQuestion(questionContainer, question, (response) => {
    if (state.answered) return;
    state.answered = true;
    const correct = gradeResponse(question, response);
    if (correct) state.score += question.points || 100;
    scoreEl.textContent = `Score: ${state.score}`;
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

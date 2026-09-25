import { supabase } from "./supabase-client.js";
import { renderQuestion, gradeResponse } from "./question-types.js";
import { getParam } from "./utils.js";

const state = {
  title: "",
  description: "",
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

const playingHeader = document.getElementById("playing-header");
const playingTitleEl = document.getElementById("playing-title");
const playingDescEl = document.getElementById("playing-desc");

const heroSection = document.getElementById("hero-section");
const fallbackLabel = document.getElementById("fallback-label");

const progressEl = document.getElementById("progress");
const scoreEl = document.getElementById("running-score");
const questionContainer = document.getElementById("question-container");
const nextBtn = document.getElementById("next-btn");
const endQuizBtn = document.getElementById("end-quiz-btn");

const finalScoreEl = document.getElementById("final-score");
const retryBtn = document.getElementById("retry-btn");

function show(view) {
  [introView, confirmView, quizView, doneView].forEach((v) => (v.style.display = "none"));
  // intro-view is a two-box bento row (display: grid in site-chrome.css);
  // everything else is a single stacked .panel.
  view.style.display = view === introView ? "grid" : "block";
  // The "Now playing" title + description sits above the quiz window and
  // stays up through the done screen, so the score screen still says
  // which quiz it was for; it's irrelevant for the picker/confirm steps.
  playingHeader.style.display = view === quizView || view === doneView ? "block" : "none";
  // The big "Practice on your own" hero and its picker boxes are only
  // useful when nothing is selected yet — once a quiz is confirmed,
  // playing or finished, collapse it to a small combined label so it
  // doesn't sit as dead weight between the quiz and the category grid.
  const idle = view === introView;
  heroSection.style.display = idle ? "block" : "none";
  fallbackLabel.textContent = idle ? "Or browse by category" : "Quizzes — Browse by category";
}

let quizzesById = {};

// Shared by the dropdown's "Go to quiz" button, a grid tile, and the
// "Quiz of the day" link — all funnel through the same named confirmation
// with an explicit "Start the quiz" button, rather than any of them
// launching straight into question 1.
function showConfirmFor(quizId) {
  const quiz = quizzesById[quizId];
  if (!quiz) return;
  confirmTitleEl.textContent = quiz.title;
  confirmDescEl.textContent = quiz.description || "";
  show(confirmView);
  loadLearnMore(quizId);
  confirmStartBtn.onclick = async () => {
    await loadQuestions(quizId);
    beginQuiz();
  };
}

// Optional "Want to go further?" link (quizzes.learn_more_*, migration-012)
// — e.g. the free lesson or the course lesson where this grammar is taught.
// Fetched separately so that if the columns don't exist yet, the query just
// fails quietly and the page behaves exactly as before.
const learnMoreEls = document.querySelectorAll("[data-learn-more]");
let learnMoreFor = null;

function renderLearnMore(info) {
  const url = info && info.learn_more_url;
  const ok = typeof url === "string" && /^https:\/\//.test(url);
  learnMoreEls.forEach((box) => {
    box.textContent = "";
    box.style.display = ok ? "block" : "none";
    if (!ok) return;
    const text = document.createElement("div");
    text.textContent = info.learn_more_text || "Want to go further?";
    const link = document.createElement("a");
    link.href = url;
    link.textContent = (info.learn_more_link_text || "Learn more") + " →";
    box.append(text, link);
  });
}

async function loadLearnMore(quizId) {
  if (learnMoreFor === quizId) return;
  learnMoreFor = quizId;
  renderLearnMore(null);
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("learn_more_text, learn_more_link_text, learn_more_url")
      .eq("id", quizId)
      .maybeSingle();
    if (learnMoreFor === quizId) renderLearnMore(error ? null : data);
  } catch (e) {
    renderLearnMore(null);
  }
}

async function loadQuizList() {
  let { data, error } = await supabase
    .from("quizzes")
    .select("id, title, description, slug")
    .eq("available_for_practice", true)
    .order("created_at");
  if (error) {
    // No slug column yet (pre migration-010) — same query as before.
    ({ data, error } = await supabase
      .from("quizzes")
      .select("id, title, description")
      .eq("available_for_practice", true)
      .order("created_at"));
  }
  if (error || !data || data.length === 0) {
    quizSelect.innerHTML = `<option value="">No quizzes available for practice yet</option>`;
    startBtn.disabled = true;
    return;
  }
  quizzesById = Object.fromEntries(data.map((q) => [q.id, q]));
  quizSelect.innerHTML = data.map((q) => `<option value="${q.id}">${q.title}</option>`).join("");
  startBtn.disabled = false;

  // Arriving via practice.html?quiz=<id> (a grid tile or the "Quiz of the
  // day" link) — don't launch straight into question 1, show the same
  // named confirmation the dropdown now uses.
  // practice.html?slug=<slug> works the same way, for quizzes whose
  // id isn't fixed (e.g. lesson pages linking to the older Feelings quizzes).
  let preselect = getParam("quiz");
  const slugParam = getParam("slug");
  if (!preselect && slugParam) {
    const bySlug = data.find((q) => q.slug === slugParam);
    if (bySlug) preselect = bySlug.id;
  }
  if (preselect && quizzesById[preselect]) {
    quizSelect.value = preselect;
    showConfirmFor(preselect);
  }
}

async function loadQuestions(quizId) {
  loadLearnMore(quizId);
  const { data: quiz } = await supabase.from("quizzes").select("title, description").eq("id", quizId).single();
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position");
  state.title = quiz?.title || "Quiz";
  state.description = quiz?.description || "";
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
  playingTitleEl.textContent = state.title;
  playingDescEl.textContent = state.description;
  playingDescEl.style.display = state.description ? "block" : "none";
  show(quizView);
  renderCurrent();
}

startBtn.addEventListener("click", () => {
  showConfirmFor(quizSelect.value);
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

// Let someone bail out of a quiz in progress rather than being stuck until
// the last question — shows the same done screen, scored as far as they got.
endQuizBtn.addEventListener("click", () => {
  if (!confirm("End this quiz now? You'll see your score so far.")) return;
  show(doneView);
  finalScoreEl.textContent = state.score;
});

loadQuizList();

const codeFromLink = getParam("code");
if (codeFromLink) {
  codeInput.value = codeFromLink;
  startWithCode(codeFromLink);
}

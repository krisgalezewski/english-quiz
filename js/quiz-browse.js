// ==========================================================================
// English Quiz — category artwork grid (practice.html only)
//
// Fetches every public quiz (available_for_practice = true), groups it into
// the same three sections /lessons/ uses (Grammar / Vocabulary / Use of
// English), and renders a card per quiz with an artwork panel — same tile
// shape as /lessons/'s LESSONS grid. This runs alongside, not instead of,
// the existing dropdown/code logic in js/practice.js: both read the same
// `quizzes` table independently, so nothing here touches that file.
//
// Requires migration-010 (adds quizzes.category + quizzes.slug). If that
// hasn't been run yet, the select below errors and this quietly hides the
// whole grid section — the dropdown and room-code box above it still work,
// so a quiz always stays reachable even with no category set.
// ==========================================================================

import { supabase } from "./supabase-client.js";

const CATS = [
  { key: "Grammar", grid: "gridGrammar", count: "countGrammar", card: "var(--cat-grammar)", dotAlpha: "0.09" },
  { key: "Vocabulary", grid: "gridVocabulary", count: "countVocabulary", card: "var(--cat-vocabulary)", dotAlpha: "0.09" },
  { key: "Use of English", grid: "gridUseOfEnglish", count: "countUseOfEnglish", card: "var(--cat-use-of-english)", dotAlpha: "0.1" },
];

function categoryFallbackSlug(category) {
  if (category === "Grammar") return "_placeholder-grammar";
  if (category === "Vocabulary") return "_placeholder-vocabulary";
  return "_placeholder-use-of-english";
}

// Fetch + inject each card's art panel as an HTML fragment (rather than
// <img src>) so the Archivo/JetBrains Mono webfonts apply to any text
// drawn inside it — same reasoning as /lessons/'s loadArt. Real per-quiz
// art (from the Claude Design handoff) is plain HTML/CSS, not SVG — see
// assets/art/README.md. Falls back to the category placeholder SVG when
// the quiz has no slug yet, or its named file 404s (art not made yet).
const artCache = {};
function loadArt(el, quiz) {
  if (!el) return;
  const primaryUrl = quiz.slug ? `assets/art/${quiz.slug}.html` : null;
  const fallbackUrl = `assets/art/${categoryFallbackSlug(quiz.category)}.svg`;

  function useFallback() {
    if (artCache[fallbackUrl]) {
      el.innerHTML = artCache[fallbackUrl];
      return;
    }
    fetch(fallbackUrl)
      .then((r) => (r.ok ? r.text() : null))
      .then((svg) => {
        if (!svg) return;
        artCache[fallbackUrl] = svg;
        el.innerHTML = svg;
      })
      .catch(() => {});
  }

  if (!primaryUrl) {
    useFallback();
    return;
  }
  if (artCache[primaryUrl]) {
    el.innerHTML = artCache[primaryUrl];
    return;
  }
  fetch(primaryUrl)
    .then((r) => (r.ok ? r.text() : null))
    .then((svg) => {
      if (!svg) {
        useFallback();
        return;
      }
      artCache[primaryUrl] = svg;
      el.innerHTML = svg;
    })
    .catch(useFallback);
}

function escapeHtml(s) {
  const div = document.createElement("div");
  div.textContent = s == null ? "" : s;
  return div.innerHTML;
}

function buildTile(quiz, cat) {
  const a = document.createElement("a");
  a.className = "qz-tile";
  a.href = `practice.html?quiz=${quiz.id}`;
  a.style.setProperty("--tile-card", cat.card);
  a.style.setProperty("--tile-ink", "var(--cat-ink)");
  a.style.setProperty("--tile-dot-alpha", cat.dotAlpha);

  const count = Number.isFinite(quiz.questionCount) ? `${quiz.questionCount} Q` : "";
  a.innerHTML =
    '<div class="qz-tile__art" data-art></div>' +
    '<div class="qz-tile__body">' +
    '<div class="qz-tile__kicker"><span>' + escapeHtml(quiz.category) + '</span><span>' + count + "</span></div>" +
    '<div class="qz-tile__title">' + escapeHtml(quiz.title) + "</div>" +
    '<div class="qz-tile__desc">' + escapeHtml(quiz.description || "") + "</div>" +
    '<span class="qz-tile__cta">Practice quiz →</span>' +
    "</div>";

  loadArt(a.querySelector("[data-art]"), quiz);
  return a;
}

async function renderCategoryGrid() {
  const section = document.getElementById("quiz-categories");
  if (!section) return;

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, description, category, slug, questions(count)")
    .eq("available_for_practice", true)
    .order("created_at");

  if (error || !data || data.length === 0) {
    section.style.display = "none";
    return;
  }

  const quizzes = data.map((q) => ({
    ...q,
    questionCount: Array.isArray(q.questions) && q.questions[0] ? q.questions[0].count : null,
  }));

  let shown = 0;
  CATS.forEach((cat) => {
    const grid = document.getElementById(cat.grid);
    const countEl = document.getElementById(cat.count);
    const catSection = grid ? grid.closest(".qz-cat") : null;
    if (!grid) return;

    const inCat = quizzes.filter((q) => q.category === cat.key);
    if (inCat.length === 0) {
      if (catSection) catSection.style.display = "none";
      return;
    }
    shown += inCat.length;
    inCat.forEach((q) => grid.appendChild(buildTile(q, cat)));
    if (countEl) countEl.textContent = `${inCat.length} ready`;
  });

  // No public quiz has a category set yet (migration ran, but nobody's
  // tagged a quiz) — hide the empty section rather than show three blank
  // headers; the dropdown/code box below still lists everything.
  if (shown === 0) section.style.display = "none";
}

renderCategoryGrid();

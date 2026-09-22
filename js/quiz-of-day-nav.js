// ==========================================================================
// English Quiz — "Quiz of the day" nav pill
//
// Included on index.html, play.html and practice.html so the pill behaves
// identically everywhere: it's a real link (not a same-page #anchor, which
// did nothing useful once the three pages stopped sharing one page to
// scroll around), and once a public quiz is available it points straight
// at that specific quiz rather than the generic self-practice list.
//
// Uses the same date-seeded pick as js/index.js's loadQuizOfTheDay (sum
// char codes of today's ISO date, mod the list length) so both agree on
// which quiz is "today's", and reruns that tiny query independently here
// rather than sharing state with index.js, since this script also needs
// to run on pages index.js never loads on.
// ==========================================================================

import { supabase } from "./supabase-client.js";

async function wireQuizOfDayNav() {
  const link = document.getElementById("quiz-of-day-nav");
  if (!link) return;

  const { data, error } = await supabase
    .from("quizzes")
    .select("id")
    .eq("available_for_practice", true);

  if (error || !data || data.length === 0) return; // leave the plain practice.html fallback href

  const today = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (const ch of today) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const pick = data[seed % data.length];

  link.href = `practice.html?quiz=${pick.id}`;
}

wireQuizOfDayNav();

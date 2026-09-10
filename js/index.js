import { supabase } from "./supabase-client.js";

const card = document.getElementById("quiz-of-day-card");
const titleEl = document.getElementById("quiz-of-day-title");

async function loadQuizOfTheDay() {
  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title")
    .eq("available_for_practice", true);

  if (error || !data || data.length === 0) return; // stays hidden - nothing public yet

  // Pick the same "random" quiz all day by seeding on today's date, so it
  // doesn't change every time someone reloads the page.
  const today = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (const ch of today) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const pick = data[seed % data.length];

  titleEl.textContent = pick.title;
  card.href = `practice.html?quiz=${pick.id}`;
  card.style.display = "flex";
}

loadQuizOfTheDay();

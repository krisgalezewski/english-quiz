-- Migration 010: quiz categories + artwork slug
--
-- Adds the two columns the new practice-page browse grid needs:
--   - category: groups public quizzes into the same three sections used on
--     englishvoiced.com/lessons/ (Grammar / Vocabulary / Use of English).
--     A quiz with no category still works fine via the room-code box and
--     the "Or pick a quiz" dropdown — it just won't appear in the grid.
--   - slug: names the quiz's artwork file at assets/art/<slug>.svg, the
--     same convention /lessons/ uses. Leave it null until you've made art
--     for that quiz with Claude Design — the grid falls back to a plain
--     category-colored placeholder panel when slug is null or the file
--     404s, so nothing breaks in the meantime.

alter table quizzes
  add column if not exists category text
  check (category in ('Grammar', 'Vocabulary', 'Use of English'));

alter table quizzes
  add column if not exists slug text;

-- Example — run for each quiz you want visible in the new grid:
--   update quizzes
--   set category = 'Vocabulary', slug = 'phrasal-verbs-quiz'
--   where title = 'Phrasal Verbs — Set 1';

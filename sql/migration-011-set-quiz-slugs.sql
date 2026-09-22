-- Sets quizzes.slug for the 9 quizzes that now have real artwork from the
-- Claude Design handoff (assets/art/<slug>.html). js/quiz-browse.js uses
-- this column to find each quiz's artwork file; without it, a quiz falls
-- back to its category's generic placeholder.
--
-- Run this in the Supabase SQL editor (same place migration-010 ran).
-- If any title below doesn't match exactly, that one update just won't
-- affect a row — check `select title, slug from quizzes;` afterwards.

update quizzes set slug = 'irregular-most'      where title = '20 Most Common Irregular Verbs';
update quizzes set slug = 'irregular-less'      where title = '20 Less Common Irregular Verbs';
update quizzes set slug = 'modals'              where title = 'Common Modal Verbs';
update quizzes set slug = 'feelings-advanced'   where title = 'Feelings & Emotions - Advanced Vocabulary';
update quizzes set slug = 'feelings-idioms'     where title = 'Feelings Idioms';
update quizzes set slug = 'business-idioms'     where title = 'Business Idioms';
update quizzes set slug = 'phrasal-verbs'       where title = 'Business Phrasal Verbs';
update quizzes set slug = 'linking-common'      where title = 'Common Linking Words and Phrases';
update quizzes set slug = 'linking-advanced'    where title = 'Advanced Linking Words and Phrases';

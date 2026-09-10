-- Fixes for the Feelings & Emotions quiz you already seeded.
-- Run this once in the Supabase SQL editor. Safe to run even if you have
-- the duplicate copy from running the seed twice - it fixes both.

-- Q5: "an infuriated letter" was bad grammar (letters can't be infuriated,
-- only people). Rewritten so "infuriated" describes the customer instead.
update questions q
set prompt = 'The customer, ___ after being overcharged, demanded to see the manager.'
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Feelings & Emotions - Advanced Vocabulary'
  and q.position = 4;

-- Q3: broaden accepted synonyms (the sentence genuinely fits more than one
-- word from the "sad - formal" column).
update questions q
set payload = jsonb_set(payload, '{altAnswers}', '["disheartened", "melancholy", "upset"]'::jsonb)
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Feelings & Emotions - Advanced Vocabulary'
  and q.position = 2;

-- Q8: same idea for "anxious - informal".
update questions q
set payload = jsonb_set(payload, '{altAnswers}', '["jittery", "on edge", "scared stiff"]'::jsonb)
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Feelings & Emotions - Advanced Vocabulary'
  and q.position = 7;

-- Q6 and Q10 (word builder): drop the old hand-typed 'scrambled' field.
-- The app now shuffles the letters of 'answer' itself at render time, so
-- it's genuinely randomized (and re-shuffled fresh every time it's played).
update questions q
set payload = '{"answer": "TICKED OFF"}'::jsonb
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Feelings & Emotions - Advanced Vocabulary'
  and q.position = 5;

update questions q
set payload = '{"answer": "GOBSMACKED"}'::jsonb
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Feelings & Emotions - Advanced Vocabulary'
  and q.position = 9;

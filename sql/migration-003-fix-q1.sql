-- Run in the Supabase SQL editor. Fixes the ambiguous Q1 prompt - without
-- "good news," any of the four options could plausibly fit.

update questions q
set prompt = 'She was absolutely ___ when she got the good news about the job.'
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Feelings & Emotions - Advanced Vocabulary'
  and q.position = 0;

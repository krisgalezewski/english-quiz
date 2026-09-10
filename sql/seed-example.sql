-- Optional: run after schema.sql to have one working quiz to test with.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values ('Phrasal Verbs — Set 1', 'Warm-up quiz for the phrasal verbs lesson', array['phrasal-verbs', 'b1'])
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)
select id, 0, 'mcq',
  'She decided to ___ smoking this year.',
  '{"options": ["give up", "give in", "give away", "give out"], "correctIndex": 0}'::jsonb,
  20, 100
from new_quiz
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "I need to ___ up early tomorrow for the flight.", "answer": "wake", "altAnswers": ["get"]}'::jsonb,
  20, 100
from new_quiz
union all
select id, 2, 'word_builder',
  'Unscramble the letters to find the phrasal verb particle + verb.',
  '{"answer": "GIVE UP"}'::jsonb,
  25, 150
from new_quiz;

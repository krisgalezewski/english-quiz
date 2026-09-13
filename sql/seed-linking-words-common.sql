-- Common Linking Words and Phrases
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Common Linking Words and Phrases',
    'Everyday connectors for contrast, cause, result, addition, and sequence',
    array['grammar', 'linking-words', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'It was raining heavily. ___, we decided to go for a walk.',
  '{"options": ["However", "Because", "So", "For example"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "She was very tired, ___ she decided to finish her homework before going to bed.", "answer": "although", "altAnswers": ["though"]}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'He missed the bus ___ he woke up late.',
  '{"options": ["because", "however", "in addition", "therefore"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "The exam was very difficult, ___ many students failed it.", "answer": "so", "altAnswers": ["therefore"]}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'I love coffee. My brother, ___, prefers tea.',
  '{"options": ["on the other hand", "because", "so", "for example"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the missing linking phrase, as in: There are many fruits I like, ___, apples and bananas.',
  '{"answer": "FOR EXAMPLE"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing phrase.',
  '{"sentence": "She is a talented singer. ___, she plays the piano beautifully.", "answer": "In addition", "altAnswers": ["Also"]}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'The team worked very hard all season. ___, they won the championship.',
  '{"options": ["As a result", "However", "For example", "Although"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the missing phrase used to introduce your first point, as in: ___, let us look at the budget.',
  '{"answer": "FIRST OF ALL"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "We discussed the schedule, the budget, and, ___, who would be responsible for each task.", "answer": "finally"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'The bridge was closed for repairs. ___, traffic was diverted through the city center.',
  '{"options": ["Therefore", "Although", "For example", "But"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the missing word, used to introduce a contrasting idea, as in: I wanted to go out, ___ it started raining.',
  '{"answer": "BUT"}'::jsonb,
  25, 150
from new_quiz;

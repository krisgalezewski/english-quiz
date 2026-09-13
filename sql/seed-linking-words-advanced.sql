-- Advanced Linking Words and Phrases
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Advanced Linking Words and Phrases',
    'Formal and academic connectors for contrast, cause, result, and condition',
    array['grammar', 'linking-words', 'advanced', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'The results were disappointing. ___, the team remained optimistic about future projects.',
  '{"options": ["Nevertheless", "Furthermore", "Consequently", "Whereas"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "The proposal is well researched. ___, it includes a detailed budget plan.", "answer": "Furthermore", "altAnswers": ["Moreover"]}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'Sales dropped sharply last quarter. ___, the company decided to cut costs.',
  '{"options": ["Consequently", "Whereas", "Albeit", "Given that"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "Some employees prefer working from home, ___ others feel more productive in the office.", "answer": "whereas", "altAnswers": ["while"]}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'You may borrow the equipment ___ you return it by Friday.',
  '{"options": ["provided that", "whereas", "hence", "albeit"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the missing phrase meaning despite, as in: The event went ahead, ___ the bad weather.',
  '{"answer": "IN SPITE OF"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing phrase.',
  '{"sentence": "___ the weather forecast predicted heavy rain, the outdoor event was moved indoors.", "answer": "Given that"}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'The evidence was overwhelming; ___, the jury reached a quick verdict.',
  '{"options": ["hence", "whereas", "albeit", "given that"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the missing word, a formal way of saying although, as in: The plan was risky, ___ potentially very profitable.',
  '{"answer": "ALBEIT"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "The bridge was structurally unsound; ___, it was closed to the public immediately.", "answer": "thus"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'The critics panned the film. ___, it became a huge box office success.',
  '{"options": ["Nonetheless", "Furthermore", "Given that", "Provided that"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the missing word, a formal way of saying in addition, as in: The report was thorough; ___, it was well written.',
  '{"answer": "MOREOVER"}'::jsonb,
  25, 150
from new_quiz;

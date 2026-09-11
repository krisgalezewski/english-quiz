-- Business Idioms
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Business Idioms',
    'Common idioms used in meetings, projects, and workplace conversation',
    array['idioms', 'business', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'Which idiom means to think creatively, in an unconventional way?',
  '{"options": ["to think outside the box", "to cut corners", "to touch base", "to raise the bar"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "We should touch ___ next week to check on progress.", "answer": "base"}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'To start a project or process moving is to get the ___ rolling.',
  '{"options": ["ball", "bar", "bullet", "plate"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "After the long discussion, we finally felt we were on the same ___ about the plan.", "answer": "page"}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'Which idiom means to do something poorly or cheaply to save time or money?',
  '{"options": ["to cut corners", "to go the extra mile", "to raise the bar", "to bite the bullet"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the missing word: making extra effort beyond what is expected is going the extra ___.',
  '{"answer": "MILE"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "After the failed launch, the team went back to the drawing ___ to redesign the product.", "answer": "board"}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'Which idiom describes a situation that is good for both sides involved?',
  '{"options": ["a win-win situation", "a level playing field", "a double-edged sword", "a leap of faith"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the missing word: to face a difficult situation with courage is to bite the ___.',
  '{"answer": "BULLET"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "Please keep me in the ___ about any updates on the project.", "answer": "loop"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'Which idiom means to set higher standards?',
  '{"options": ["to raise the bar", "to cut corners", "to touch base", "to have a lot on your plate"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the missing word: something occupying your time and attention is having a lot on your ___.',
  '{"answer": "PLATE"}'::jsonb,
  25, 150
from new_quiz;

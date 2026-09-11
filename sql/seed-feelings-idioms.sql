-- Feelings Idioms
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Feelings Idioms',
    'Idioms for describing emotions and reactions',
    array['idioms', 'emotions', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'Which idiom means to feel extremely happy?',
  '{"options": ["to be walking on air", "to have a lump in your throat", "to bite your tongue", "to lose your temper"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "She felt nervous butterflies in her ___ before the interview.", "answer": "stomach"}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'Which idiom means to suddenly become very angry?',
  '{"options": ["to lose your temper", "to bite your tongue", "to get something off your chest", "to have a lump in your throat"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "During the sad film, she had a ___ in her throat and almost cried.", "answer": "lump"}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'What does to bite your tongue mean?',
  '{"options": ["to stop yourself from saying what you really feel", "to speak to someone in a sharp, angry way", "to feel extremely happy", "to talk about a worry so you feel relieved"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the missing verb: to ___ up your feelings means to hide or suppress strong emotions.',
  '{"answer": "BOTTLE"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "After weeks of worry, he finally got it off his ___ and told his friend everything.", "answer": "chest"}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'Which idiom means to speak to someone in a sharp, angry way?',
  '{"options": ["to snap at someone", "to lose your temper", "to be walking on air", "to bite your tongue"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the missing word: to have butterflies in your ___.',
  '{"answer": "STOMACH"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "He was so thrilled after winning the award that he felt like he was ___ on air.", "answer": "walking"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'Which idiom means to talk about something that has been worrying you, so you feel relieved?',
  '{"options": ["to get something off your chest", "to bottle up your feelings", "to snap at someone", "to have a lump in your throat"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the missing verb: to ___ your temper means to suddenly become very angry.',
  '{"answer": "LOSE"}'::jsonb,
  25, 150
from new_quiz;

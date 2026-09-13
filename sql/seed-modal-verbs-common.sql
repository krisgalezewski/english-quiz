-- Common Modal Verbs
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Common Modal Verbs',
    'Ability, obligation, advice, possibility, permission, deduction, and requests',
    array['grammar', 'modal-verbs', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'She ___ speak three languages fluently.',
  '{"options": ["can", "must", "should", "would"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "You ___ wear a seatbelt while driving, it is the law.", "answer": "must", "altAnswers": ["have to"]}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'If you want to improve your pronunciation, you ___ practice speaking every day.',
  '{"options": ["should", "can", "will", "must"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "It ___ rain later, so bring an umbrella just in case.", "answer": "might", "altAnswers": ["may"]}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  '___ I use your phone for a moment?',
  '{"options": ["May", "Must", "Should", "Will"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the missing modal verb, as in: When he was young, he ___ run very fast.',
  '{"answer": "COULD"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "___ you please pass the salt?", "answer": "Could", "altAnswers": ["Would", "Can", "Will"]}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'The lights are off and the car is gone. She ___ have already left for work.',
  '{"options": ["must", "should", "can", "will"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the missing modal verb used for a formal suggestion, as in: ___ we begin the meeting?',
  '{"answer": "SHALL"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "I am sure she ___ arrive on time, she is always punctual.", "answer": "will"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'Passengers ___ not smoke on this train.',
  '{"options": ["must", "can", "would", "might"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the missing modal verb, a polite way to say want to, as in: ___ you like some tea?',
  '{"answer": "WOULD"}'::jsonb,
  25, 150
from new_quiz;

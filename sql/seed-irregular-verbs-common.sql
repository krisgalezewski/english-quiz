-- 20 Most Common Irregular Verbs
-- Target vocabulary (base - past simple - past participle):
-- be-was/were-been, have-had-had, do-did-done, say-said-said, get-got-got/gotten,
-- make-made-made, go-went-gone, know-knew-known, take-took-taken, see-saw-seen,
-- come-came-come, think-thought-thought, give-gave-given, find-found-found,
-- send-sent-sent, become-became-become, show-showed-shown, leave-left-left,
-- feel-felt-felt, put-put-put
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    '20 Most Common Irregular Verbs',
    'Past simple and past participle forms of the 20 most frequently used irregular verbs',
    array['grammar', 'irregular-verbs', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'Yesterday, she ___ to the store to buy milk.',
  '{"options": ["went", "gone", "goed", "going"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "I have never ___ such a beautiful sunset in my life.", "answer": "seen"}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'By the time we arrived, they had already ___ dinner.',
  '{"options": ["made", "make", "maked", "making"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "She ___ her lost keys under the sofa yesterday.", "answer": "found"}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'He has already ___ his homework.',
  '{"options": ["done", "did", "doed", "do"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the past participle of take, as in: I have ___ the bus to work all week.',
  '{"answer": "TAKEN"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "They ___ a beautiful cake for the party last week.", "answer": "made"}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'At first, she ___ the plan was a bad idea, but she changed her mind.',
  '{"options": ["thought", "thinked", "think", "thinking"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the past simple form of come, as in: they ___ to visit us last summer.',
  '{"answer": "CAME"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "He has ___ a famous actor since his first movie.", "answer": "become"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'She ___ him a letter last week explaining everything.',
  '{"options": ["sent", "sended", "send", "sending"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the past participle of give, as in: she has ___ him a second chance.',
  '{"answer": "GIVEN"}'::jsonb,
  25, 150
from new_quiz;

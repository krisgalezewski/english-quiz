-- Business Phrasal Verbs
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Business Phrasal Verbs',
    'Common phrasal verbs used in a business and workplace context',
    array['phrasal-verbs', 'business', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'The company plans to ___ its new product line next month.',
  '{"options": ["roll out", "cut back on", "phase out", "pull out"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "We need to ___ up a formal contract before signing.", "answer": "draw"}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'After the merger, the larger firm decided to ___ the smaller one completely.',
  '{"options": ["take over", "follow up", "branch out", "team up"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "Due to falling profits, the firm had to ___ back on unnecessary spending.", "answer": "cut"}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'She started her own business last year, managing to ___ from scratch.',
  '{"options": ["set it up", "phase it out", "pull it out", "cut it back"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the missing verb: to gradually stop using something old in favor of something new is to ___ out.',
  '{"answer": "PHASE"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "I will ___ up with the client next week to check on the proposal.", "answer": "follow"}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'The startup wants to ___ into international markets next year.',
  '{"options": ["branch out", "pull out", "carry out", "bring in"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the missing verb: to withdraw from an agreement or deal is to ___ out.',
  '{"answer": "PULL"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "The two companies decided to ___ up on the new research project together.", "answer": "team"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'The manager decided to ___ extra staff for the busy season.',
  '{"options": ["bring in", "cut back on", "phase out", "pull out"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the missing verb: to perform or complete a plan is to ___ out.',
  '{"answer": "CARRY"}'::jsonb,
  25, 150
from new_quiz;

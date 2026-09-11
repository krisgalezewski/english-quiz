-- 20 Less Common Irregular Verbs
-- Target vocabulary (base - past simple - past participle):
-- bend-bent-bent, bite-bit-bitten, blow-blew-blown, catch-caught-caught,
-- choose-chose-chosen, dig-dug-dug, draw-drew-drawn, drive-drove-driven,
-- fly-flew-flown, forget-forgot-forgotten, freeze-froze-frozen, hang-hung-hung,
-- hide-hid-hidden, hold-held-held, lend-lent-lent, ride-rode-ridden,
-- ring-rang-rung, shake-shook-shaken, steal-stole-stolen, swim-swam-swum
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    '20 Less Common Irregular Verbs',
    'Past simple and past participle forms of 20 useful but less frequently practiced irregular verbs',
    array['grammar', 'irregular-verbs', 'vocabulary']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1
select id, 0, 'mcq',
  'The thief ___ a valuable painting from the museum last night.',
  '{"options": ["stole", "stolen", "steal", "stealed"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2
union all
select id, 1, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "The birds have ___ away to warmer countries for the winter.", "answer": "flown"}'::jsonb,
  20, 100
from new_quiz

-- 3
union all
select id, 2, 'mcq',
  'She ___ her hand in surprise when she saw the party guests.',
  '{"options": ["shook", "shaken", "shake", "shaked"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 4
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "He ___ a beautiful picture of the mountains during his trip.", "answer": "drew"}'::jsonb,
  20, 100
from new_quiz

-- 5
union all
select id, 4, 'mcq',
  'The children have ___ several holes in the garden looking for treasure.',
  '{"options": ["dug", "digged", "dig", "dugged"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6
union all
select id, 5, 'word_builder',
  'Unscramble the past participle of choose, as in: she has already ___ her favorite dress.',
  '{"answer": "CHOSEN"}'::jsonb,
  25, 150
from new_quiz

-- 7
union all
select id, 6, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "The lake completely ___ during the cold winter night.", "answer": "froze"}'::jsonb,
  20, 100
from new_quiz

-- 8
union all
select id, 7, 'mcq',
  'He ___ his coat on the hook by the door.',
  '{"options": ["hung", "hanged", "hang", "hunged"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 9
union all
select id, 8, 'word_builder',
  'Unscramble the past simple form of catch, as in: she ___ the ball with one hand.',
  '{"answer": "CAUGHT"}'::jsonb,
  25, 150
from new_quiz

-- 10
union all
select id, 9, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "I had never ___ a horse before this weekend.", "answer": "ridden"}'::jsonb,
  20, 100
from new_quiz

-- 11
union all
select id, 10, 'mcq',
  'The children ___ across the lake without any help.',
  '{"options": ["swam", "swum", "swimmed", "swim"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 12
union all
select id, 11, 'word_builder',
  'Unscramble the past participle of forget, as in: I have completely ___ his name.',
  '{"answer": "FORGOTTEN"}'::jsonb,
  25, 150
from new_quiz;

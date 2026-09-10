-- Feelings & Emotions - Advanced Vocabulary
-- Run this once in the Supabase SQL editor.

with new_quiz as (
  insert into quizzes (title, description, tags)
  values (
    'Feelings & Emotions - Advanced Vocabulary',
    'Formal and informal ways to talk about emotions',
    array['emotions', 'vocabulary', 'advanced', 'formal-informal']
  )
  returning id
)
insert into questions (quiz_id, position, type, prompt, payload, time_limit_seconds, points)

-- 1. Happy - formal
select id, 0, 'mcq',
  'She was absolutely ___ when she got the good news about the job.',
  '{"options": ["elated", "exasperated", "bewildered", "apathetic"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 2. Happy - informal
union all
select id, 1, 'mcq',
  'Which phrase means extremely happy, in an informal way?',
  '{"options": ["over the moon", "down in the dumps", "ticked off", "at a loss"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 3. Sad - formal
union all
select id, 2, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "After failing the exam, she felt utterly ___.", "answer": "downcast", "altAnswers": ["disheartened", "melancholy", "upset"]}'::jsonb,
  20, 100
from new_quiz

-- 4. Sad - informal
union all
select id, 3, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "I did not get the part in the play, I am so ___.", "answer": "gutted", "altAnswers": ["down in the dumps", "blue"]}'::jsonb,
  20, 100
from new_quiz

-- 5. Angry - formal
union all
select id, 4, 'mcq',
  'The customer, ___ after being overcharged, demanded to see the manager.',
  '{"options": ["infuriated", "chuffed", "apprehensive", "mortified"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 6. Angry - informal
union all
select id, 5, 'word_builder',
  'Unscramble the letters to find an informal way of saying very annoyed.',
  '{"answer": "TICKED OFF"}'::jsonb,
  25, 150
from new_quiz

-- 7. Anxious / Scared - formal
union all
select id, 6, 'mcq',
  'He felt increasingly ___ as the interview approached.',
  '{"options": ["apprehensive", "elated", "indignant", "unenthusiastic"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 8. Anxious / Scared - informal
union all
select id, 7, 'gap_fill',
  'Fill in the missing word or phrase.',
  '{"sentence": "Waiting for the results, she was completely ___.", "answer": "freaked out", "altAnswers": ["jittery", "on edge", "scared stiff"]}'::jsonb,
  20, 100
from new_quiz

-- 9. Surprised - formal
union all
select id, 8, 'mcq',
  'The scientists were ___ by the unexpected results.',
  '{"options": ["astounded", "downcast", "apathetic", "humiliated"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz

-- 10. Surprised - informal
union all
select id, 9, 'word_builder',
  'Unscramble the letters to find an informal word meaning very surprised.',
  '{"answer": "GOBSMACKED"}'::jsonb,
  25, 150
from new_quiz

-- 11. Bored / Indifferent - formal
union all
select id, 10, 'gap_fill',
  'Fill in the missing word.',
  '{"sentence": "He seemed completely ___ about the outcome, showing no interest either way.", "answer": "indifferent", "altAnswers": ["apathetic", "unenthusiastic"]}'::jsonb,
  20, 100
from new_quiz

-- 12. Confused - informal
union all
select id, 11, 'mcq',
  'Which informal phrase means confused, unable to understand?',
  '{"options": ["at a loss", "over the moon", "chuffed", "indignant"], "correctIndex": 0}'::jsonb,
  15, 100
from new_quiz;

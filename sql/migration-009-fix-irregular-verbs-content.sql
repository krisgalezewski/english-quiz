-- Run in the Supabase SQL editor.

-- Fix 1: "tell a letter" is not a real collocation - you write/send a
-- letter, not tell one. Swapped to "sent" per your correction.
update questions q
set prompt = 'She ___ him a letter last week explaining everything.',
    payload = '{"options": ["sent", "sended", "send", "sending"], "correctIndex": 0}'::jsonb
from quizzes z
where q.quiz_id = z.id
  and z.title = '20 Most Common Irregular Verbs'
  and q.position = 10;

-- Fix 2: "shook her hand" (shaking someone else's hand, a greeting) reads
-- oddly with "in surprise" and no other person mentioned - "shook her
-- head" is the natural idiom for a reaction of surprise/disbelief.
update questions q
set prompt = 'She ___ her head in surprise when she saw the party guests.'
from quizzes z
where q.quiz_id = z.id
  and z.title = '20 Less Common Irregular Verbs'
  and q.position = 2;

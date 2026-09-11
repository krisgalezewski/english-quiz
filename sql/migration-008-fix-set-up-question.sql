-- Run in the Supabase SQL editor.
-- Fixes "...managing to set up it from scratch" (ungrammatical - separable
-- phrasal verbs need the pronoun between the verb and the particle) by
-- rewriting the sentence and options to include the pronoun in each choice.

update questions q
set prompt = 'She started her own business last year, managing to ___ from scratch.',
    payload = '{"options": ["set it up", "phase it out", "pull it out", "cut it back"], "correctIndex": 0}'::jsonb
from quizzes z
where q.quiz_id = z.id
  and z.title = 'Business Phrasal Verbs'
  and q.position = 4;

-- Resets self-practice visibility. Run this whenever you want to "re-lock"
-- a quiz for testing, or if you unlocked something by accident.
-- (After the code update, you can also just click the toggle button again
-- on the host's finished screen - this SQL is only needed this once,
-- to clear the leftover state from earlier testing.)

update quizzes
set available_for_practice = false
where title = 'Feelings & Emotions - Advanced Vocabulary';

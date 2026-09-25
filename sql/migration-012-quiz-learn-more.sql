-- Migration 012: optional "Want to go further?" link per quiz
--
-- Shown on practice.html before a quiz starts and on the score screen, e.g.
-- "This grammar is taught step by step in Lesson 3 of the English+ B1+/B2
-- Grammar Course. See the course →". All three columns are optional: a quiz
-- with no learn_more_url simply shows nothing extra.
--
-- The lesson-quiz seed files (seed-lesson-quizzes-*.sql) already include
-- these three lines, so you only need this file on its own if you want the
-- columns before running those. Safe to run more than once.

alter table quizzes add column if not exists learn_more_text text;
alter table quizzes add column if not exists learn_more_link_text text;
alter table quizzes add column if not exists learn_more_url text;

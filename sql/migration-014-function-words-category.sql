-- Migration 014: a fourth quiz category, "Function Words"
--
-- The English+ Function Words I and II courses get their own section on
-- practice.html ("Function Words: Where Vocabulary Meets Grammar", violet,
-- see --cat-function-words in css/tokens.css) instead of sitting under
-- Grammar. This migration:
--   1. widens the category check from migration-010 to allow 'Function Words'
--   2. moves the 22 function-words lesson quizzes into it
--      (matched by their course tag, so no ids to copy by hand).
-- Run once in the Supabase SQL editor, before re-running either
-- seed-lesson-quizzes-english-plus-function-words-*.sql (those now set
-- category = 'Function Words' themselves). Safe to run more than once.

begin;

-- migration-010 created an unnamed column check; Postgres names it
-- quizzes_category_check, but drop any check on quizzes.category to be safe.
do $$
declare c record;
begin
  for c in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_attribute att on att.attrelid = rel.oid and att.attnum = any(con.conkey)
    where rel.relname = 'quizzes' and con.contype = 'c' and att.attname = 'category'
  loop
    execute format('alter table quizzes drop constraint %I', c.conname);
  end loop;
end $$;

alter table quizzes
  add constraint quizzes_category_check
  check (category in ('Grammar', 'Vocabulary', 'Use of English', 'Function Words'));

update quizzes
set category = 'Function Words'
where tags && array['english-plus-function-words-1', 'english-plus-function-words-2'];

commit;

-- Check: should list 22 rows, all 'Function Words'.
-- select title, category from quizzes
-- where tags && array['english-plus-function-words-1', 'english-plus-function-words-2'];

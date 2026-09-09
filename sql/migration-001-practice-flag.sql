-- Run this once against your existing database (the one you already set up
-- in english-games). Adds the self-practice visibility flag and lets the
-- host toggle it after a live session ends.

alter table quizzes add column if not exists available_for_practice boolean not null default false;

create policy "quizzes updatable by anyone" on quizzes for update using (true);

grant update on quizzes to anon, authenticated;

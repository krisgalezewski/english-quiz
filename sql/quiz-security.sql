-- ============================================================================
-- SECURITY: QUIZ + GAMES project
-- Supabase project: mumvnjyiupzvmcoatwye
--
-- Before: anyone with the public website key could start, run or end quiz
-- sessions, change any quiz's settings and room code, and rewrite any
-- player's details.
-- After:
--   * Running quizzes and changing quiz settings needs your teacher login
--     (the Host page asks you to sign in once).
--   * Students can still join, answer, and update their own score.
--   * The games leaderboard only accepts sensible names and scores.
--
-- BEFORE RUNNING: create your teacher login in THIS project too
-- (Authentication → Users → Add user → Create new user, email
-- kris@englishvoiced.com, a strong password, tick "Auto Confirm User"), and
-- turn off public sign-ups (Authentication → Sign In / Providers → "Allow new
-- users to sign up" OFF). If you use a different email, change it below.
--
-- Run the whole file once in the SQL Editor. Safe to run again.
-- ============================================================================

create schema if not exists private;
create or replace function private.is_teacher()
returns boolean language sql stable as $$
  select coalesce(lower(auth.jwt() ->> 'email') in ('kris@englishvoiced.com'), false)
$$;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_teacher() to anon, authenticated;

-- Nobody outside needs these table-level powers
revoke truncate, references, trigger on quizzes, questions, sessions, players, answers, leaderboard from anon, authenticated;

-- ── quizzes: everyone reads; only the teacher changes settings/room codes ───
drop policy if exists "quizzes updatable by anyone" on quizzes;
drop policy if exists "teacher updates quizzes"     on quizzes;
revoke update on quizzes from anon, authenticated;
grant update on quizzes to authenticated;
create policy "teacher updates quizzes" on quizzes for update to authenticated
  using (private.is_teacher()) with check (private.is_teacher());

-- ── sessions: everyone reads (to follow the live quiz); only the teacher runs them
drop policy if exists "sessions insertable by anyone" on sessions;
drop policy if exists "sessions updatable by anyone"  on sessions;
drop policy if exists "teacher creates sessions"      on sessions;
drop policy if exists "teacher runs sessions"         on sessions;
revoke insert, update on sessions from anon, authenticated;
grant insert, update on sessions to authenticated;
create policy "teacher creates sessions" on sessions for insert to authenticated with check (private.is_teacher());
create policy "teacher runs sessions"    on sessions for update to authenticated
  using (private.is_teacher()) with check (private.is_teacher());

-- ── players: anyone joins; only the score can be updated afterwards ─────────
revoke update on players from anon, authenticated;
grant update (score) on players to anon, authenticated;

-- ── leaderboard: sensible names and scores only (existing rows untouched) ───
alter table leaderboard drop constraint if exists leaderboard_name_ok;
alter table leaderboard drop constraint if exists leaderboard_score_ok;
alter table leaderboard drop constraint if exists leaderboard_game_ok;
alter table leaderboard add constraint leaderboard_name_ok  check (char_length(btrim(player_name)) between 1 and 24) not valid;
alter table leaderboard add constraint leaderboard_score_ok check (score between 0 and 10000000) not valid;
alter table leaderboard add constraint leaderboard_game_ok  check (game ~ '^[A-Za-z0-9_-]{1,60}$') not valid;

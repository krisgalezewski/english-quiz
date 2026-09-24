-- ============================================================================
-- Automatic data cleanup: QUIZ + GAMES project
-- Supabase project: mumvnjyiupzvmcoatwye
--
-- Keeps the promise in englishvoiced.com/privacy/: quiz results are deleted
-- within 12 months. Deleting an old quiz session also deletes its players
-- (names, avatars, scores, rejoin codes) and their answers, because the
-- tables are linked with "on delete cascade".
--
-- Not touched: the quizzes and questions themselves (your content, no personal
-- data), and the games leaderboard (the policy says entries stay until someone
-- asks you to remove them, or you reset the board).
--
-- HOW TO USE (Supabase dashboard → this project → SQL Editor → New query):
--   STEP 1  Run the PREVIEW block alone. It only reads, and shows what would be removed.
--   STEP 2  Run the INSTALL block once. It creates the cleanup and schedules it
--           every Sunday at 03:15 UTC.
--   Later   See what each run deleted:  select * from private.cleanup_log order by ran_at desc;
--           Run it by hand:             select private.cleanup_old_data();
--           Stop the schedule:          select cron.unschedule('privacy-cleanup');
-- ============================================================================


-- ─── STEP 1: PREVIEW (read-only) ────────────────────────────────────────────
select
  (select count(*) from sessions where created_at < now() - interval '12 months') as old_sessions,
  (select count(*) from players p join sessions s on s.id = p.session_id
    where s.created_at < now() - interval '12 months')                             as players_that_would_go,
  (select count(*) from answers a join sessions s on s.id = a.session_id
    where s.created_at < now() - interval '12 months')                             as answers_that_would_go,
  (select min(created_at) from sessions)                                           as oldest_session;


-- ─── STEP 2: INSTALL (run once) ─────────────────────────────────────────────
-- A schema the website's public API can't reach, so visitors can never call this.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.cleanup_log (
  ran_at        timestamptz not null default now(),
  sessions      int not null,
  players       int not null,
  answers       int not null
);

create or replace function private.cleanup_old_data()
returns text
language plpgsql
as $$
declare
  cutoff constant timestamptz := now() - interval '12 months';
  n_sessions int; n_players int; n_answers int;
begin
  select count(*) into n_players from players p join sessions s on s.id = p.session_id where s.created_at < cutoff;
  select count(*) into n_answers from answers a join sessions s on s.id = a.session_id where s.created_at < cutoff;

  delete from sessions where created_at < cutoff;   -- players and answers go with them (cascade)
  get diagnostics n_sessions = row_count;

  insert into private.cleanup_log (sessions, players, answers) values (n_sessions, n_players, n_answers);
  return format('%s old quiz sessions removed (%s players, %s answers)', n_sessions, n_players, n_answers);
end;
$$;

revoke all on function private.cleanup_old_data() from public, anon, authenticated;

-- The scheduler (built into Supabase). Safe to run again: it replaces the job.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('privacy-cleanup', '15 3 * * 0', $$select private.cleanup_old_data()$$);

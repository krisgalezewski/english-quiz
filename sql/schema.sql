-- English Quiz — Supabase schema
-- Run this once in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- ---------- Content ----------

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  tags text[] not null default '{}',
  available_for_practice boolean not null default false, -- only quizzes flagged true show up in self-practice
  created_at timestamptz not null default now()
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references quizzes(id) on delete cascade,
  position int not null,
  type text not null check (type in ('mcq', 'gap_fill', 'word_builder')),
  prompt text not null,
  payload jsonb not null,      -- shape depends on `type`, see README
  time_limit_seconds int not null default 20 check (time_limit_seconds between 1 and 60),
  points int not null default 100
);

create index if not exists questions_quiz_id_position_idx
  on questions (quiz_id, position);

-- ---------- Live sessions ----------

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,              -- short room code, e.g. "7HXQ"
  quiz_id uuid not null references quizzes(id),
  status text not null default 'lobby'    -- lobby | question | reveal | finished
    check (status in ('lobby', 'question', 'reveal', 'finished')),
  current_question int not null default 0,
  question_started_at timestamptz,
  time_limit_seconds int check (time_limit_seconds between 1 and 60), -- overrides each question's own limit when set
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  avatar text not null,        -- emoji or short code, see js/avatars.js
  score int not null default 0,
  joined_at timestamptz not null default now()
);

create table if not exists answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  question_id uuid not null references questions(id),
  response jsonb,
  is_correct boolean not null default false,
  time_taken_ms int,
  created_at timestamptz not null default now(),
  unique (player_id, question_id)
);

-- ---------- Row Level Security ----------
-- This app has no user accounts — the "room code" is the access control,
-- same trust model as Kahoot. Policies below are intentionally permissive
-- (fine for a small class of known students). Tighten later if needed.

alter table quizzes enable row level security;
alter table questions enable row level security;
alter table sessions enable row level security;
alter table players enable row level security;
alter table answers enable row level security;

create policy "quizzes readable by anyone" on quizzes for select using (true);
create policy "quizzes updatable by anyone" on quizzes for update using (true);
create policy "questions readable by anyone" on questions for select using (true);

create policy "sessions readable by anyone" on sessions for select using (true);
create policy "sessions insertable by anyone" on sessions for insert with check (true);
create policy "sessions updatable by anyone" on sessions for update using (true);

create policy "players readable by anyone" on players for select using (true);
create policy "players insertable by anyone" on players for insert with check (true);
create policy "players updatable by anyone" on players for update using (true);

create policy "answers readable by anyone" on answers for select using (true);
create policy "answers insertable by anyone" on answers for insert with check (true);

-- Row Level Security policies only take effect once the anon/authenticated
-- roles have base table access — grant that here.
grant usage on schema public to anon, authenticated;
grant select, update on quizzes to anon, authenticated;
grant select on questions to anon, authenticated;
grant select, insert, update on sessions, players to anon, authenticated;
grant select, insert on answers to anon, authenticated;

-- ---------- Realtime ----------
-- Broadcasts row changes to subscribed clients (host + students).

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table players;
alter publication supabase_realtime add table answers;

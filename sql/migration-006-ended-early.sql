-- Run in the Supabase SQL editor.
alter table sessions add column if not exists ended_early boolean not null default false;

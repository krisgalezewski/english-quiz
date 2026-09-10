-- Run in the Supabase SQL editor.
alter table players add column if not exists return_code text unique;

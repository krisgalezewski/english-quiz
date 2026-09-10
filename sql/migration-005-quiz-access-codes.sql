-- Run in the Supabase SQL editor.
-- Moves the "room code" from being per-session (regenerated every time you
-- host) to being permanent per-quiz. This is what lets you look up and
-- share a quiz's code at any time, even days after the live session ended.

alter table quizzes add column if not exists access_code text unique;

-- The app will auto-generate a code for any quiz missing one the next time
-- you open the host page, but seeding one now for existing quizzes avoids a
-- brief "no code yet" moment on first load.
update quizzes
set access_code = upper(substr(md5(random()::text || id::text), 1, 4))
where access_code is null;

-- sessions.code is no longer used for anything - the quiz's access_code is
-- the single source of truth now. Drop it rather than leave a confusing
-- unused/unique column around.
alter table sessions drop column if exists code;

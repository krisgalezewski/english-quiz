# English Quiz

A live, Kahoot-style quiz for your online students (host mode), plus a
solo self-practice mode they can use afterwards. Static site + Supabase,
same pattern as your other two projects.

## 1. Set up Supabase

1. Create a new Supabase project (or reuse an existing one).
2. Open the SQL editor and run `sql/schema.sql`.
3. Optionally run `sql/seed-example.sql` to get one working quiz to test with.
4. In Project settings → API, copy your **Project URL** and **anon public key**
   into `js/supabase-client.js`.
5. In Database → Replication, confirm `sessions`, `players`, and `answers`
   are enabled for Realtime (the schema script does this already, but it's
   worth a glance).

## 2. Try it locally

Any static file server works, e.g.:

```
npx serve .
```

Open `index.html`. Host a quiz in one tab/device, join it from another
(or your phone) using the room code.

## 3. Deploy

Push this folder to a GitHub repo and enable GitHub Pages, same as your
other projects — no build step needed.

## Adding a new quiz (this is the part you'll do most often)

Each question is one row in the `questions` table, shaped like this:

```json
{
  "type": "mcq",
  "prompt": "She decided to ___ smoking this year.",
  "payload": { "options": ["give up", "give in", "give away", "give out"], "correctIndex": 0 },
  "time_limit_seconds": 20,
  "points": 100
}
```

```json
{
  "type": "gap_fill",
  "prompt": "Fill in the missing word.",
  "payload": { "sentence": "I need to ___ up early tomorrow.", "answer": "wake", "altAnswers": ["get"] },
  "time_limit_seconds": 20,
  "points": 100
}
```

```json
{
  "type": "word_builder",
  "prompt": "Unscramble the letters to find the phrasal verb.",
  "payload": { "answer": "GIVE UP" },
  "time_limit_seconds": 25,
  "points": 150
}
```

The app shuffles the letters of `answer` itself, fresh every time the
question is rendered — you never need to hand-type a scramble.

Workflow going forward: send me the new vocab/grammar point, I'll hand
back a `quizzes` + `questions` insert statement (like `sql/seed-example.sql`)
that you paste into the Supabase SQL editor. No code changes needed.

## Lesson quizzes (one per lesson)

Every lesson on englishvoiced.com/lessons/ and every lesson in both English+
courses has a public 12-question quiz — 57 new quizzes:

- `sql/seed-lesson-quizzes-lessons.sql` — 15 /lessons/ pages. The Feelings and
  Emotions lesson links to the two existing Feelings quizzes instead of a
  near-duplicate new one.
- `sql/seed-lesson-quizzes-english-plus-b1-b2.sql` — English+ B1+/B2, lessons 1–22
- `sql/seed-lesson-quizzes-english-plus-b2-c1.sql` — English+ B2+/C1, lessons 1–20

Run each once in the Supabase SQL editor. Every quiz and question has a fixed
id, so running a file again updates the wording in place instead of adding
duplicates — and each lesson page links straight to `practice.html?quiz=<id>`.
Existing quizzes can also be linked by slug: `practice.html?slug=feelings-advanced`.

Course quizzes are named after the grammar they test (e.g. "Present Perfect vs
Past Simple"); the description says which course lesson teaches it.

True/false and "spot the mistake" questions use the existing `mcq` type
(options `True`/`False`, or the parts of the sentence), so no question-type
code changed.

### "Want to go further?" link

`quizzes.learn_more_text`, `learn_more_link_text` and `learn_more_url`
(migration-012, also included at the top of each lesson-quiz seed file) add a
box to practice.html — before the quiz starts and on the score screen —
pointing to the free lesson or to the course overview page. A quiz without a
`learn_more_url` shows nothing extra, and if the columns don't exist yet the
page simply works as before.

The Function Words quizzes point to the free previews on
englishvoiced.com/courses/: the Lesson 1 quizzes open Lesson 1 there, and the
others open the preview's course page with `?locked=N`, which says that lesson
is in the full course and how to contact Kris
(`sql/migration-015-function-words-preview-links.sql`).

### Editing the lesson quizzes

The content lives in `tools/lesson-quizzes/` (one Python file per group of
lessons). Edit a question there, run `python3 tools/lesson-quizzes/build.py`,
and re-run the changed seed file. `lesson-quiz-links.json` lists every quiz id
with its lesson.

## Category + artwork (practice.html's browse grid)

practice.html now presents public quizzes as a `/lessons/`-style grid —
one artwork card per quiz, grouped into Grammar / Vocabulary / Use of
English — above the original dropdown and room-code box, which are kept
exactly as they were as a fast fallback for once the list gets long.

This needs `sql/migration-010-add-quiz-category.sql` run once in the
Supabase SQL editor, which adds two columns to `quizzes`:

- **`category`** — `'Grammar'`, `'Vocabulary'`, or `'Use of English'`.
  A quiz with no category still works fine via the dropdown/code box; it
  just won't appear in the grid.
- **`slug`** — names the quiz's artwork file at `assets/art/<slug>.html`
  (an HTML/CSS fragment, not an image — see below). Leave it `null` until
  you've made art for that quiz with Claude Design — the card falls back
  to a plain category-coloured placeholder SVG (already in `assets/art/`)
  when `slug` is null or the file 404s, so nothing ever looks broken
  while art is pending.

So the insert statement I hand back for a new quiz going forward will
include both, e.g.:

```sql
insert into quizzes (title, description, tags, category, slug)
values ('Phrasal Verbs — Set 1', 'Warm-up quiz for the phrasal verbs lesson',
        array['phrasal-verbs', 'b1'], 'Vocabulary', 'phrasal-verbs-quiz')
returning id;
```

To backfill an existing quiz:

```sql
update quizzes
set category = 'Vocabulary', slug = 'phrasal-verbs-quiz'
where title = 'Phrasal Verbs — Set 1';
```

Only quizzes with `available_for_practice = true` (the existing Public
toggle on the host page) are ever fetched for the grid, same as the
dropdown already worked.

### How the artwork itself works

Each card's `.qz-tile__art` panel (fixed 165px tall, full-bleed at the top
of the card, dot-texture background) is filled by fetching
`assets/art/<slug>.html` and injecting its contents with `innerHTML` — the
same technique `/lessons/` uses, just with a plain HTML/CSS fragment
instead of an SVG. That's a deliberate choice from the Claude Design
handoff: the artwork is built entirely from `<div>`/`<span>` markup with
inline styles (text, pills, circles, sticky notes — no images, no SVG), so
`js/quiz-browse.js` fetches it as text and drops it straight into the art
panel, same as it would an SVG file. Each fragment only contains the
artwork's own children — position, height, overflow and the dot texture
all come from the shared `.qz-tile__art` CSS class in `css/site-chrome.css`,
so a new fragment doesn't need to repeat them.

To add a new artwork: design it the same way (Archivo Black display type,
JetBrains Mono 500 captions, cream `#F6EBDD` ink at various alphas, one
real example as the focal element plus a couple of supporting details),
save it as `assets/art/<slug>.html`, and set that quiz's `slug` column to
match.

### Fixed-size artwork (lesson quizzes)

The 57 lesson-quiz artworks (second Claude Design handoff) are drawn on a
fixed 322 × 165 px box with absolutely positioned pieces, so they can't reflow
like the older flex-based art. Each fragment's root is
`<div class="qz-art-fixed" aria-hidden="true">`; `js/quiz-browse.js` centres
that box in the tile and scales it as a whole to fit (`--art-scale`),
re-fitting whenever the grid resizes. Their slugs are set by the seed files
(and by `sql/migration-013-lesson-quiz-artwork.sql` for a database seeded
before the art existed); the slug list is in `tools/lesson-quizzes/art_slugs.py`.

## Adding a new question type later

1. Add the type to the `check` constraint on `questions.type` in
   `sql/schema.sql` (or just relax the constraint).
2. Add a `render` + `grade` function to `js/question-types.js` and register
   it in the `TYPES` map at the bottom.
3. Everything else — host reveal, live scoring, self-practice — picks it up
   automatically, since they all go through `renderQuestion` / `gradeResponse`.

## How the live mode syncs

There's no websocket code to write by hand — Supabase Realtime subscribes
to row changes on `sessions`, `players`, and `answers`:

- The host updates `sessions.status` / `current_question` to advance the game.
- Students subscribe to that one session row and react to changes.
- Each student inserts their own row into `answers` and (if correct) bumps
  their own `players.score`.
- The `answers` table has a unique constraint on `(player_id, question_id)`,
  so a student can't double-submit for the same question.

This means the game state lives in the database, not just in memory — if
your host tab reloads mid-lesson, the session and scores are still there.

## Room codes and self-practice access

Each quiz has its own **permanent** code (`quizzes.access_code`) — not a
new random code every time you host. That one code is what students use
both to join the live game and, once it's been played live at least
once, to self-practice:

- **On the host page**, the "Your quizzes" list shows every quiz with its
  code and a Public/Private toggle. You can look up and copy a quiz's
  code any time — days later, for a different group — without an active
  session open.
- **Joining live**: a student's code finds your quiz, then finds whichever
  session for that quiz is currently in `lobby`/`question`/`reveal`. If
  none is running, they're told to wait for you to start it.
- **Self-practice by code**: the same code works once *any* session for
  that quiz has reached `finished`. Since each quiz's code only ever goes
  to the group you gave it to, this naturally doesn't leak across groups —
  nothing to remember to lock again between classes.
- **Public toggle** is separate and opt-in: flip a quiz to Public and it
  also shows up in the open self-practice dropdown and Quiz of the Day,
  for quizzes you're happy for anyone to find, no code required.

## Security note

There's no login system — room codes are the access control, the same
trust model as Kahoot. Row Level Security policies are intentionally
permissive (any player can read/write session data) since this is built
for small, known groups of students. If you ever open this up beyond
your own classes, tighten the RLS policies in `sql/schema.sql` first.

## Scoring

A correct answer earns a question's `points` value, minus 10 for every
full 10 seconds it took to answer, down to a floor of 10 points. So a
100-point question answered in 8 seconds is worth 100; answered in 25
seconds it's worth 80 (two full 10-second chunks elapsed); it never goes
below 10 as long as the answer is correct. Wrong answers always earn 0,
regardless of speed.

## Sound and celebration

- `js/sound.js` synthesizes short tones with the Web Audio API — a ding
  when everyone's answered (host-only, toggleable in the host's setup
  screen) and a small fanfare at the end of a game. Nothing to host or
  download; it's generated in the browser.
- Confetti uses [canvas-confetti](https://github.com/catdad/canvas-confetti),
  loaded from a CDN in `host.html` and `play.html`. If your school network
  or a browser extension ever blocks that CDN, the site still works —
  confetti just silently won't appear.

## What's stubbed / good next steps

- **Word builder** currently checks for one target phrase, closer to an
  unscramble task than your existing multi-word Word Builder game. Can be
  extended to "find as many words as you can" if you want that variant here too.
- **Practice history**: self-practice mode doesn't save scores anywhere
  yet — it's session-only. Easy to add a `practice_attempts` table if you
  want students to see their improvement over time.
- **Quiz of the Day** picks from whatever's in the public list, seeded by
  today's date so it doesn't change on every reload — but it's still just
  one shared pick for everyone, not personalized.

## Ending a quiz early, and players dropping out

The host has an "End quiz now" button (lobby and live game) for cutting a
session short. Students see a distinct "The host ended the quiz early"
message rather than the normal finish screen.

Separately, the app tracks who's actively connected using Supabase
Realtime Presence (not just who's in the `players` table — someone can be
in that table but have closed their tab). When a player's tab closes or
they lose connection, their avatar disappears from the live "who's here"
displays (lobby list, in-game avatar roster) for the host and other
students, and the host gets a brief on-screen notice. Their score and
answers-so-far are *not* deleted — the scoreboard still shows them,
just dimmed with a "(left)" tag, so you don't lose track of a game
in progress.

## End-of-game stats (host only, never saved)

On the host's finished screen, `renderGameStats` in `js/host.js`
computes a handful of stats fresh from that session's `answers` — top
question, toughest question, quickest single answer, most accurate
player, fastest average responder, and any perfect scores. Nothing here
is written back to the database; refresh the page and it's gone, by
design (you didn't ask for a persistent analytics feature, just an
end-of-game recap).

## Reconnecting after a disconnect

Every player gets a `return_code` when they join (separate from the
quiz's room code). Each player chip in the host's lobby and scoreboard
has a small 🔑 button that copies that player's code — this works
regardless of whether presence has correctly flagged them as away, since
waiting on presence detection alone proved too slow/unreliable to be the
only way to reach it. The dimmed "(left)" tag is a best-effort visual
hint, not a gate on the code being available.

Students also see their own return code right after joining (above the
"Back to home" link), so they have it even if you're not immediately
available to share it.

The student reconnects via "Got disconnected? Reconnect with your return
code" on the Join page — this restores their *same* player row (same
score, same history), not a new player.

## Scoring timing

Points are calculated and written to `players.score` when the host
reveals the answer, not the moment a student submits. The elapsed time
used for the speed-based deduction is still the real submission time
(captured client-side and stored in `answers.time_taken_ms`) — only the
*writing* of the score is deferred. This avoids a subtle race where a
disconnect between submit and reveal could otherwise award (or fail to
award) points inconsistently.

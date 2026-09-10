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

## Self-practice access — two paths, on purpose

Since you reuse quizzes across different groups, self-practice is gated
so a group can't see a quiz before *their own* live session with you:

1. **Room code (default, private to that group)**: once a live session's
   status is `finished`, its room code works on the self-practice page too.
   Each group only ever has their own code, so this naturally doesn't leak
   across groups — nothing to toggle, nothing to remember to lock again.
2. **Public list + "Quiz of the Day" (opt-in, host-controlled)**: on the
   host's finished screen, "Also add to the public self-practice list"
   flips `quizzes.available_for_practice` to `true`. This is for quizzes
   you're genuinely fine with anyone browsing anytime — it's what powers
   the public dropdown on the practice page and the homepage's Quiz of the
   Day card. It's a real toggle (click again to remove it), and defaults
   to off for every quiz.

Use path 1 for anything tied to a specific group's lesson. Use path 2
only for quizzes you'd be happy for any student, from any group, to find.

## Security note

There's no login system — room codes are the access control, the same
trust model as Kahoot. Row Level Security policies are intentionally
permissive (any player can read/write session data) since this is built
for small, known groups of students. If you ever open this up beyond
your own classes, tighten the RLS policies in `sql/schema.sql` first.

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

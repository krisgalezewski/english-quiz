"""Builds the lesson-quiz seed files in english-quiz/sql/ from the quiz
data in this folder (site*.py = /lessons/, b1*.py = English+ B1+/B2,
b2*.py = English+ B2+/C1). Edit a question, run `python3 build.py`, then
re-run the changed seed file in the Supabase SQL editor — fixed ids mean it
updates in place. lesson-quiz-links.json lists every quiz id + lesson URL.
"""
import json, random, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import common
from art_slugs import ART_SLUGS
for m in ["site1", "site2", "site3", "b1a", "b1b", "b1c", "b2a", "b2b", "b2c"]:
    __import__(m)
Q = common.QUIZZES
keys = [q["key"] for q in Q]
assert len(keys) == len(set(keys)), "duplicate quiz key"
titles = [q["title"] for q in Q]
assert len(titles) == len(set(titles)), "duplicate quiz title"
print(len(Q), "quizzes,", sum(len(q["questions"]) for q in Q), "questions")

PRACTICE = "https://englishvoiced.com/english-quiz/practice.html?quiz="


def lit(s):
    return "'" + s.replace("'", "''") + "'"


def shuffled_payload(q, x):
    """MCQ options are shuffled on screen anyway; also vary correctIndex in the DB so the
    stored answer isn't always option 0 (True/False and spot-the-mistake keep their order)."""
    p = dict(x["payload"])
    if x["kind"] == "mcq":
        rng = random.Random(x["id"])
        opts = list(p["options"])
        correct = opts[p["correctIndex"]]
        rng.shuffle(opts)
        p = {"options": opts, "correctIndex": opts.index(correct)}
    return p


HEADER = """-- {title}
-- Generated lesson quizzes: {n} quizzes x 12 questions, all public (available_for_practice = true).
-- Run once in the Supabase SQL editor (needs migration-010 for category/slug).
-- Safe to re-run: fixed ids + ON CONFLICT means a re-run updates the text instead of duplicating.
-- Each quiz keeps a fixed id, so lesson pages can link to practice.html?quiz=<id>.
-- Only inserts/updates these quizzes (fixed ids below) — existing quizzes are not touched{extra_note}.

begin;

-- Same as migration-012: the "Want to go further?" link shown on the practice page.
alter table quizzes add column if not exists learn_more_text text;
alter table quizzes add column if not exists learn_more_link_text text;
alter table quizzes add column if not exists learn_more_url text;
"""


def sql_for(group, title, extra=""):
    out = [HEADER.format(title=title, n=len(group), extra_note=" (except the learn-more link noted at the end)" if extra else "")]
    for q in group:
        out.append(f"\n-- {q['title']}\n-- Lesson: {q['lesson_url']}")
        out.append(
            "insert into quizzes (id, title, description, tags, category, slug, available_for_practice,\n"
            "                     learn_more_text, learn_more_link_text, learn_more_url)\n"
            f"values ({lit(q['id'])}, {lit(q['title'])}, {lit(q['description'])},\n"
            f"        array[{', '.join(lit(t) for t in q['tags'])}], {lit(q['category'])}, {lit(ART_SLUGS[q['key']])}, true,\n"
            f"        {lit(q['learn_more']['text'])}, {lit(q['learn_more']['link_text'])}, {lit(q['learn_more']['url'])})\n"
            "on conflict (id) do update set title = excluded.title, description = excluded.description,\n"
            "  tags = excluded.tags, category = excluded.category, slug = excluded.slug, available_for_practice = true,\n"
            "  learn_more_text = excluded.learn_more_text, learn_more_link_text = excluded.learn_more_link_text,\n"
            "  learn_more_url = excluded.learn_more_url;")
        rows = []
        for i, x in enumerate(q["questions"]):
            payload = json.dumps(shuffled_payload(q, x), ensure_ascii=False)
            rows.append(f"  ({lit(x['id'])}, {lit(q['id'])}, {i}, {lit(x['type'])},\n"
                        f"   {lit(x['prompt'])},\n   {lit(payload)}::jsonb, {x['time']}, {x['points']})")
        out.append("insert into questions (id, quiz_id, position, type, prompt, payload, time_limit_seconds, points) values\n"
                   + ",\n".join(rows) +
                   "\non conflict (id) do update set position = excluded.position, type = excluded.type,\n"
                   "  prompt = excluded.prompt, payload = excluded.payload,\n"
                   "  time_limit_seconds = excluded.time_limit_seconds, points = excluded.points;")
    out.append(extra)
    out.append("\ncommit;\n")
    return "\n".join(out)


here = os.path.dirname(os.path.abspath(__file__))
outdir = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, "..", "..", "sql")
os.makedirs(outdir, exist_ok=True)
groups = [
    ("site", "seed-lesson-quizzes-lessons.sql", "Lesson quizzes — englishvoiced.com/lessons/ (15 new quizzes; Feelings and Emotions uses the 2 existing Feelings quizzes)"),
    ("english-plus-b1-b2", "seed-lesson-quizzes-english-plus-b1-b2.sql", "Lesson quizzes — English+ B1+/B2 Grammar Course (22 lessons)"),
    ("english-plus-b2-c1", "seed-lesson-quizzes-english-plus-b2-c1.sql", "Lesson quizzes — English+ B2+/C1 Companion Course (20 lessons)"),
]
# The existing Feelings and linking-word quizzes already cover those lessons,
# so they get the same "go further" link (matched by the slug set in
# migration-011) instead of a near-duplicate new quiz. Only these 3 columns.
EXISTING = [
    (["feelings-advanced", "feelings-idioms"], "Feelings and Emotions", "/lessons/english-feelings-and-emotions.html"),
    (["linking-common", "linking-advanced"], "Transitional Words", "/lessons/english-transitional-words.html"),
]
EXTRA = "\n-- Existing quizzes for two lessons: add the same \"go further\" link to the lesson"
for slugs, topic, path in EXISTING:
    EXTRA += ("\nupdate quizzes set\n"
              f"  learn_more_text = {lit(f'Want to go further? The free interactive lesson on {topic} explains it all, with plenty more practice.')},\n"
              f"  learn_more_link_text = 'Open the lesson', learn_more_url = {lit('https://englishvoiced.com' + path)}\n"
              f"where slug in ({', '.join(lit(x) for x in slugs)});")
for key, fname, title in groups:
    g = [q for q in Q if q["course"] == key]
    open(os.path.join(outdir, fname), "w").write(sql_for(g, title, EXTRA if key == "site" else ""))
    print(fname, len(g))

assert set(ART_SLUGS) == {q["key"] for q in Q}, "every quiz needs an artwork slug"
for q in Q:
    assert os.path.exists(os.path.join(here, "..", "..", "assets", "art", ART_SLUGS[q["key"]] + ".html")), q["key"]

# One-off file for databases where the seeds ran before the artwork existed.
art_sql = ["-- Migration 013: artwork for the 57 lesson quizzes",
           "-- Sets quizzes.slug so practice.html's grid loads assets/art/<slug>.html",
           "-- (Claude Design handoff design_handoff_quiz_artwork). Only touches these",
           "-- 57 quizzes, matched by their fixed ids. Safe to run more than once.",
           "", "begin;"]
for q in Q:
    art_sql.append(f"update quizzes set slug = {lit(ART_SLUGS[q['key']])} where id = {lit(q['id'])};  -- {q['title']}")
art_sql += ["commit;", ""]
open(os.path.join(outdir, "migration-013-lesson-quiz-artwork.sql"), "w").write("\n".join(art_sql))

links = {q["key"]: dict(id=q["id"], title=q["title"], course=q["course"], lesson=q["lesson_file"],
                        lesson_url=q["lesson_url"], quiz_url=PRACTICE + q["id"]) for q in Q}
json.dump(links, open(os.path.join(here, "lesson-quiz-links.json"), "w"), indent=2, ensure_ascii=False)

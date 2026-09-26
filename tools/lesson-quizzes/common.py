"""Quiz registry + validation. Question tuples:
  ("mcq",  prompt, options, correct_index)
  ("tf",   statement, True/False)            -> mcq with True/False options
  ("spot", sentence, parts, wrong_part_index) -> mcq "spot the mistake"
  ("gap",  sentence_with____, answer, alt_answers)
  ("wb",   prompt, ANSWER)                   -> word_builder (scrambled letters)
"""
import re, uuid

NS = uuid.UUID("5b0c2c52-6a3e-4f0e-9d7a-e1a5f0c1d2b3")  # fixed namespace -> stable ids

B1 = dict(key="english-plus-b1-b2", full="English+ B1+/B2 Grammar Course",
          base="https://englishvoiced.com/english-plus-grammar-course/",
          overview="https://englishvoiced.com/courses/english-plus-b1-b2/")
B2 = dict(key="english-plus-b2-c1", full="English+ B2+/C1 Companion Course",
          base="https://englishvoiced.com/english-plus-b2-c1-grammar-course/",
          overview="https://englishvoiced.com/courses/english-plus-b2-c1/")

QUIZZES = []


def quiz(key, qs, lesson, tags, title=None, desc=None, category="Grammar", course=None, n=None, name=None, structures=None):
    if course:
        # Public quizzes: named after the grammar itself, so anyone can find
        # them; the course is mentioned as where that grammar is taught.
        title = name
        desc = f"{structures[0].upper()}{structures[1:]}. Taught in Lesson {n} of the {course['full']}."
        tags = [course["key"], f"lesson-{n:02d}"] + tags
        lesson_url = course["base"] + lesson
        learn = dict(text=f"Want to go further? This grammar is taught step by step in Lesson {n} of the {course['full']}.",
                     link_text="See the course", url=course["overview"])
        if "preview_open" in course:
            # Courses whose public preview on englishvoiced.com/courses/ opens
            # only the first lessons: an open lesson links straight to it; any
            # other lesson links to the preview's course page with ?locked=N,
            # which explains it's in the full course (contact Kris).
            if n <= course["preview_open"]:
                learn = dict(text=f"Want to go further? This grammar is taught step by step in Lesson {n} of the {course['full']}, and that lesson is free to try.",
                             link_text=f"Open Lesson {n} free", url=lesson_url)
            else:
                lesson_url = course["overview"] + f"?locked={n}"
                learn = dict(text=f"Want to go further? This grammar is taught step by step in Lesson {n} of the {course['full']}.",
                             link_text="See the course", url=lesson_url)
    else:
        lesson_url = "https://englishvoiced.com" + lesson
        topic = title.replace(" — Lesson Quiz", "")
        learn = dict(text=f"Want to go further? The free interactive lesson on {topic} explains it all, with plenty more practice.",
                     link_text="Open the lesson", url=lesson_url)
    q = dict(key=key, id=str(uuid.uuid5(NS, key)), title=title, description=desc, category=category,
             tags=tags, lesson_url=lesson_url, lesson_file=lesson, course=course["key"] if course else "site",
             n=n, name=name, learn_more=learn, questions=[expand(key, i, t) for i, t in enumerate(qs)])
    validate(q)
    QUIZZES.append(q)


def expand(key, i, t):
    kind = t[0]
    qid = str(uuid.uuid5(NS, f"{key}/q{i}"))
    if kind == "mcq":
        _, prompt, opts, ci = t
        return dict(id=qid, kind=kind, type="mcq", prompt=prompt,
                    payload={"options": list(opts), "correctIndex": ci}, time=15, points=100)
    if kind == "tf":
        _, stmt, val = t
        return dict(id=qid, kind=kind, type="mcq", prompt=f"True or false? {stmt}",
                    payload={"options": ["True", "False"], "correctIndex": 0 if val else 1}, time=15, points=100)
    if kind == "spot":
        _, sent, parts, wi = t
        return dict(id=qid, kind=kind, type="mcq", sentence=sent,
                    prompt=f"Spot the mistake: “{sent}” Which part is wrong?",
                    payload={"options": list(parts), "correctIndex": wi}, time=20, points=100)
    if kind == "gap":
        _, sent, ans, alts = t
        multi = " " in ans.strip()
        return dict(id=qid, kind=kind, type="gap_fill",
                    prompt="Fill in the missing words." if multi else "Fill in the missing word.",
                    payload={"sentence": sent, "answer": ans, "altAnswers": list(alts)},
                    time=25 if multi else 20, points=100)
    if kind == "wb":
        _, prompt, ans = t
        return dict(id=qid, kind=kind, type="word_builder", prompt=prompt,
                    payload={"answer": ans}, time=25, points=150)
    raise ValueError(kind)


def norm(s):
    return re.sub(r"\s+", " ", (s or "").strip().lower())


def validate(q):
    k = q["key"]
    qs = q["questions"]
    assert len(qs) == 12, f"{k}: {len(qs)} questions"
    kinds = {x["kind"] for x in qs}
    assert {"mcq", "gap", "wb"} <= kinds, f"{k}: missing a core type ({kinds})"
    assert len({norm(x["prompt"] + str(x["payload"])) for x in qs}) == 12, f"{k}: duplicate question"
    for i, x in enumerate(qs):
        p = x["payload"]
        where = f"{k} q{i+1}"
        if x["type"] == "mcq":
            o = p["options"]
            assert 2 <= len(o) <= 4, where
            assert len({norm(v) for v in o}) == len(o), f"{where}: duplicate options"
            assert 0 <= p["correctIndex"] < len(o), where
            if x["kind"] == "spot":
                for part in o:
                    assert part in x["sentence"], f"{where}: part '{part}' not in sentence"
            elif x["kind"] == "mcq" and "___" in x["prompt"]:
                assert x["prompt"].count("___") == 1, f"{where}: multiple blanks"
        elif x["type"] == "gap_fill":
            s = p["sentence"]
            assert s.count("___") == 1, f"{where}: sentence must contain exactly one ___"
            accepted = [p["answer"]] + p["altAnswers"]
            assert len({norm(a) for a in accepted}) == len(accepted), f"{where}: duplicate accepted answers"
            assert "’" not in p["answer"], f"{where}: curly apostrophe in main answer"
            # a straight apostrophe answer must also accept the curly one typed by phones
            for a in accepted:
                if "'" in a:
                    assert a.replace("'", "’") in accepted, f"{where}: add curly variant of {a!r}"
        elif x["type"] == "word_builder":
            a = p["answer"]
            assert re.fullmatch(r"[A-Z]+( [A-Z]+)*", a), f"{where}: word_builder answer must be A-Z: {a!r}"
            assert len(a.replace(" ", "")) >= 3, f"{where}: too short to scramble"
            assert "___" in x["prompt"] or "Unscramble" in x["prompt"], where
        for fld in (x["prompt"], str(p)):
            assert "<" not in fld and ">" not in fld, f"{where}: angle brackets (prompt is rendered as HTML)"

"""Artwork slug per lesson quiz: quizzes.slug -> assets/art/<slug>.html
(Claude Design handoff "design_handoff_quiz_artwork", codes g01-g48, v01-v05, u01-u04)."""

ART_SLUGS = {
    'b1-01': 'present-simple-vs-present-continuous',  # G01
    'b1-02': 'past-simple-vs-past-continuous',  # G10
    'b1-03': 'present-perfect-vs-past-simple',  # G11
    'b1-04': 'present-perfect-simple-vs-continuous',  # G12
    'b1-05': 'past-perfect-simple-vs-continuous',  # G13
    'b1-06': 'future-forms',  # G14
    'b1-07': 'future-perfect-and-future-continuous',  # G15
    'b1-08': 'modals-of-ability-permission-obligation',  # G16
    'b1-09': 'modals-of-deduction',  # G17
    'b1-10': 'modal-perfect',  # G18
    'b1-11': 'passive-voice',  # G19
    'b1-12': 'passive-extensions',  # G20
    'b1-13': 'conditionals-zero-and-first',  # G21
    'b1-14': 'second-conditional',  # G02
    'b1-15': 'third-conditional',  # G22
    'b1-16': 'mixed-conditionals',  # G03
    'b1-17': 'wish-if-only',  # G04
    'b1-18': 'reported-speech',  # G05
    'b1-19': 'relative-clauses',  # G06
    'b1-20': 'gerunds-vs-infinitives',  # G07
    'b1-21': 'articles-and-determiners',  # G08
    'b1-22': 'linking-words-hedging-and-cleft-sentences',  # G09
    'b2-01': 'narrative-tenses',  # G37
    'b2-02': 'used-to-vs-would',  # G36
    'b2-03': 'future-in-the-past',  # G35
    'b2-04': 'academic-hedging',  # G32
    'b2-05': 'needn-t-have-vs-didn-t-need-to',  # G33
    'b2-06': 'deduction-with-continuous-aspect',  # G34
    'b2-07': 'inversion-in-conditionals',  # G38
    'b2-08': 'conditional-alternatives-to-if',  # G39
    'b2-09': 'hypothetical-meaning-without-if',  # G40
    'b2-10': 'advanced-wish-if-only',  # G41
    'b2-11': 'passive-with-combined-aspects',  # G42
    'b2-12': 'impersonal-passive-and-get-passive',  # G43
    'b2-13': 'nominalisation',  # G44
    'b2-14': 'advanced-articles-and-quantifiers',  # G45
    'b2-15': 'participle-clauses',  # G46
    'b2-16': 'advanced-relative-clauses',  # G47
    'b2-17': 'ellipsis-and-substitution',  # G48
    'b2-18': 'negative-inversion-for-emphasis',  # G29
    'b2-19': 'fronting-and-information-structure',  # G30
    'b2-20': 'formal-connectors',  # G31
    'site-cleft-sentences': 'cleft-sentences-lq',  # G26
    'site-collocations': 'collocations-lq',  # V05
    'site-conditionals': 'conditionals-lq',  # G27
    'site-confusable-pairs': 'confusable-pairs-lq',  # V02
    'site-determiners': 'determiners-lq',  # G23
    'site-hedging-language': 'hedging-language-lq',  # U04
    'site-idioms': 'idioms-lq',  # V03
    'site-inversion': 'inversion-and-negative-adverbials-lq',  # G25
    'site-phrasal-verbs': 'phrasal-verbs-lq',  # V01
    'site-pronunciation': 'pronunciation-lq',  # U02
    'site-sentences-clauses': 'sentences-and-clauses-lq',  # G24
    'site-transitional-words': 'transitional-words-lq',  # U03
    'site-verb-tenses': 'verb-tenses-lq',  # G28
    'site-word-formation': 'word-formation-lq',  # V04
    'site-workplace-eq': 'workplace-eq-lq',  # U01
    'fw1-01': 'fw1-personal-possessive-and-reflexive-pronouns',  # (no artwork yet — placeholder)
    'fw1-02': 'fw1-demonstratives-and-indefinite-pronouns',  # (no artwork yet — placeholder)
    'fw1-03': 'fw1-each-every-either-neither-and-each-other',  # (no artwork yet — placeholder)
    'fw1-04': 'fw1-who-which-that-whose-plus-question-tags',  # (no artwork yet — placeholder)
    'fw1-05': 'fw1-in-on-at-time-and-place',  # (no artwork yet — placeholder)
    'fw1-06': 'fw1-dependent-prepositions',  # (no artwork yet — placeholder)
    'fw1-07': 'fw1-a-first-look-at-phrasal-verb-particles',  # (no artwork yet — placeholder)
    'fw1-08': 'fw1-and-but-or-so-plus-both-and-either-or-neither-nor',  # (no artwork yet — placeholder)
    'fw1-09': 'fw1-because-although-while',  # (no artwork yet — placeholder)
    'fw1-10': 'fw1-everyday-connecting-words',  # (no artwork yet — placeholder)
    'fw1-11': 'fw1-quantifiers-and-countability',  # (no artwork yet — placeholder)
    'fw2-01': 'fw2-formal-relative-pronouns-by-which-whom-whereby',  # (no artwork yet — placeholder)
    'fw2-02': 'fw2-generic-one-and-this-that-such-reference',  # (no artwork yet — placeholder)
    'fw2-03': 'fw2-multi-word-prepositions-due-to-in-spite-of-with-regard-to',  # (no artwork yet — placeholder)
    'fw2-04': 'fw2-stranded-prepositions-and-register',  # (no artwork yet — placeholder)
    'fw2-05': 'fw2-phrasal-verb-particles-up-out-off-over-through',  # (no artwork yet — placeholder)
    'fw2-06': 'fw2-not-only-but-also-whereas-even-though-given-that',  # (no artwork yet — placeholder)
    'fw2-07': 'fw2-moreover-nevertheless-consequently-transition-words-and-punctuation',  # (no artwork yet — placeholder)
    'fw2-08': 'fw2-subsequently-meanwhile-namely-for-instance-sequence-and-examples',  # (no artwork yet — placeholder)
    'fw2-09': 'fw2-formal-quantifiers-a-number-of-the-majority-of-few-vs-a-few',  # (no artwork yet — placeholder)
    'fw2-10': 'fw2-intensifiers-and-degree-words-very-absolutely-rather-somewhat',  # (no artwork yet — placeholder)
    'fw2-11': 'fw2-the-former-and-the-latter-respectively-do-so',  # (no artwork yet — placeholder)
}

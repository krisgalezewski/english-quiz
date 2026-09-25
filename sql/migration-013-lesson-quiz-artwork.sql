-- Migration 013: artwork for the 57 lesson quizzes
-- Sets quizzes.slug so practice.html's grid loads assets/art/<slug>.html
-- (Claude Design handoff design_handoff_quiz_artwork). Only touches these
-- 57 quizzes, matched by their fixed ids. Safe to run more than once.

begin;
update quizzes set slug = 'phrasal-verbs-lq' where id = '272e449b-8135-5f3a-a021-ae04d6ea17d0';  -- Phrasal Verbs — Lesson Quiz
update quizzes set slug = 'confusable-pairs-lq' where id = '91d7fbc9-4e2d-5b0c-a8aa-c2c57f4564a3';  -- Confusable Pairs — Lesson Quiz
update quizzes set slug = 'idioms-lq' where id = '52329a05-2251-51bd-8585-ad5a1fff7e0f';  -- Idioms — Lesson Quiz
update quizzes set slug = 'word-formation-lq' where id = '551a7af4-2366-5a1a-b6f7-09bef210abe5';  -- Word Formation — Lesson Quiz
update quizzes set slug = 'collocations-lq' where id = 'cd55b686-7dfc-57aa-a1ac-d292ac8b039e';  -- Collocations — Lesson Quiz
update quizzes set slug = 'determiners-lq' where id = '656e117d-b008-5567-97ef-661b35e30c37';  -- Determiners — Lesson Quiz
update quizzes set slug = 'sentences-and-clauses-lq' where id = 'ddbe0ab5-1b8a-567b-9f80-4dc773ab8db8';  -- Sentences & Clauses — Lesson Quiz
update quizzes set slug = 'inversion-and-negative-adverbials-lq' where id = 'ad02ea0d-4e10-5469-bf55-3f2961fdd0d4';  -- Inversion & Negative Adverbials — Lesson Quiz
update quizzes set slug = 'cleft-sentences-lq' where id = 'ea11fb4c-1714-5afc-a754-c82f60e2e2a9';  -- Cleft Sentences — Lesson Quiz
update quizzes set slug = 'conditionals-lq' where id = '1f1a4e71-7efa-5ec3-a90a-9b7612c42d10';  -- Conditionals — Lesson Quiz
update quizzes set slug = 'verb-tenses-lq' where id = 'd5369334-11c1-52c9-a704-b6f05a1fc4e3';  -- Verb Tenses — Lesson Quiz
update quizzes set slug = 'pronunciation-lq' where id = 'a99531d6-c60d-5af6-b0cb-bfcff53f77a5';  -- Pronunciation — Lesson Quiz
update quizzes set slug = 'transitional-words-lq' where id = '5d74f5e6-a984-5605-8e83-6ab84c342e48';  -- Transitional Words — Lesson Quiz
update quizzes set slug = 'hedging-language-lq' where id = 'bdb2d329-98c5-52fd-a906-fa05b74c4215';  -- Hedging Language — Lesson Quiz
update quizzes set slug = 'workplace-eq-lq' where id = 'b215141d-dd6f-57e8-b515-d3cb80bbb68f';  -- Workplace EQ — Lesson Quiz
update quizzes set slug = 'present-simple-vs-present-continuous' where id = '4a959c34-91ab-5a88-83bb-2e762a7df476';  -- Present Simple vs Present Continuous
update quizzes set slug = 'past-simple-vs-past-continuous' where id = '6b38b8e6-03fc-5cd7-a2e7-88b51e953236';  -- Past Simple vs Past Continuous
update quizzes set slug = 'present-perfect-vs-past-simple' where id = '9307db9e-29f0-560f-a5e9-f31f3892a631';  -- Present Perfect vs Past Simple
update quizzes set slug = 'present-perfect-simple-vs-continuous' where id = '74bee7ca-1922-5948-9c15-f8ca69b43a54';  -- Present Perfect Simple vs Present Perfect Continuous
update quizzes set slug = 'past-perfect-simple-vs-continuous' where id = '0b012328-f1d1-5018-bc08-e169e22f9fbd';  -- Past Perfect Simple vs Past Perfect Continuous
update quizzes set slug = 'future-forms' where id = '1aa7c602-95fa-5f37-8feb-a8495b56c609';  -- Future Forms: Will vs Going To vs Present Continuous
update quizzes set slug = 'future-perfect-and-future-continuous' where id = 'b570b9a4-847b-51d6-9f53-6c6756df4753';  -- Future Perfect, Future Perfect Continuous & Future Continuous
update quizzes set slug = 'modals-of-ability-permission-obligation' where id = 'dc94976e-f456-5fdf-a4fd-cbe3d463824a';  -- Modals of Ability, Permission, Obligation & Prohibition
update quizzes set slug = 'modals-of-deduction' where id = '745a97bd-aa69-5661-ae06-5c1171a31b28';  -- Modals of Deduction & Speculation
update quizzes set slug = 'modal-perfect' where id = '5c81ab0b-2094-506e-ba4b-b556c5239b04';  -- Modal Perfect: Should Have, Could Have, Would Have
update quizzes set slug = 'passive-voice' where id = 'df6f4cd6-18bf-52ba-aa1b-02e189fb71e1';  -- Passive Voice: Core Forms Across Tenses
update quizzes set slug = 'passive-extensions' where id = '6fb834aa-617e-5902-9d5f-551b3eb3ea1f';  -- Passive Extensions: Reporting Structures & Causative
update quizzes set slug = 'conditionals-zero-and-first' where id = '24773652-cddf-5ebc-a8b7-2511ad65dafb';  -- Conditionals: Zero & First
update quizzes set slug = 'second-conditional' where id = '3b329ecb-0c7b-5f31-bbb0-22399172861d';  -- Second Conditional
update quizzes set slug = 'third-conditional' where id = '93406a25-be3c-50e9-a452-0a47804ea8be';  -- Third Conditional
update quizzes set slug = 'mixed-conditionals' where id = 'd754c54e-155f-5432-b42d-e380917f43f1';  -- Mixed Conditionals
update quizzes set slug = 'wish-if-only' where id = '549f02ed-96b4-5f2b-a01e-5795fae0146b';  -- Wish / If Only
update quizzes set slug = 'reported-speech' where id = '633a94b6-8f3a-5a3d-b929-76d4497db3f7';  -- Reported Speech
update quizzes set slug = 'relative-clauses' where id = '405b18be-1e1d-52d4-86b2-d0a4b91d30ea';  -- Relative Clauses: Defining vs Non-defining
update quizzes set slug = 'gerunds-vs-infinitives' where id = 'cb489e52-754c-56de-9939-5c1ef05495c5';  -- Gerunds vs Infinitives
update quizzes set slug = 'articles-and-determiners' where id = 'ec92a6de-c233-50f0-9ea1-2c780c5b3ea4';  -- Articles & Determiners
update quizzes set slug = 'linking-words-hedging-and-cleft-sentences' where id = '987c3376-d8fc-5d69-b7f9-ce960419366b';  -- Linking Words, Hedging & Cleft Sentences
update quizzes set slug = 'narrative-tenses' where id = '57273d25-7c48-5a14-ab82-d6847a06a21e';  -- Narrative Tenses in Extended Storytelling
update quizzes set slug = 'used-to-vs-would' where id = 'b631d7bb-a1be-58bb-9f0b-fbc006b0e62c';  -- Used To vs Would for Past Habits
update quizzes set slug = 'future-in-the-past' where id = '9e5aecae-5530-5b27-8e20-b751b9dd804e';  -- Future in the Past + Future Perfect Continuous
update quizzes set slug = 'academic-hedging' where id = 'cba44022-25db-569b-b512-7d7b756dac14';  -- Academic Hedging: Seem To, Appear To, Tend To, Be Likely To
update quizzes set slug = 'needn-t-have-vs-didn-t-need-to' where id = 'da1d95ab-fdc4-56f9-b930-eae750766d7b';  -- Needn't Have vs Didn't Need To
update quizzes set slug = 'deduction-with-continuous-aspect' where id = 'd8211586-eb38-5ab9-9b8a-2f06dfbaf55c';  -- Deduction With Continuous Aspect
update quizzes set slug = 'inversion-in-conditionals' where id = '47b07a34-7987-5a62-bc02-f97dd5877cce';  -- Inversion in Conditionals
update quizzes set slug = 'conditional-alternatives-to-if' where id = 'f9067777-2f4c-52b1-b72c-4e4b80bb4014';  -- Conditional Alternatives to If
update quizzes set slug = 'hypothetical-meaning-without-if' where id = 'b26366a9-c1d2-5311-b214-b946427d3281';  -- Hypothetical Meaning Without If
update quizzes set slug = 'advanced-wish-if-only' where id = '196f6c6f-2120-5e67-9d7a-31e5ff45a3e7';  -- Advanced Wish / If Only
update quizzes set slug = 'passive-with-combined-aspects' where id = 'd3b6781a-f70a-58c0-ac3b-7ff0747adacd';  -- Passive With Combined Aspects
update quizzes set slug = 'impersonal-passive-and-get-passive' where id = '0bfda39a-9007-50a5-95fb-b0a926ba4d82';  -- Impersonal Passive & Get-Passive
update quizzes set slug = 'nominalisation' where id = '6e8ef29a-4d40-5f51-87fa-d3e9ebf81228';  -- Nominalisation
update quizzes set slug = 'advanced-articles-and-quantifiers' where id = '4d5f61a2-2ee0-518f-92b5-2bc03567123d';  -- Advanced Articles & Quantifiers
update quizzes set slug = 'participle-clauses' where id = '07f18556-b09e-5c98-80f7-dd6fe8b20275';  -- Participle Clauses
update quizzes set slug = 'advanced-relative-clauses' where id = 'f486c18d-4468-51eb-9368-7d964bcd68a8';  -- Advanced Relative Clauses
update quizzes set slug = 'ellipsis-and-substitution' where id = 'c32dd943-c7e9-55a0-a35d-1fec5a3ae3de';  -- Ellipsis & Substitution
update quizzes set slug = 'negative-inversion-for-emphasis' where id = 'bb2574b4-a859-5770-ad29-b3fe3076f7af';  -- Negative Inversion for Emphasis
update quizzes set slug = 'fronting-and-information-structure' where id = 'e22af0e2-f74a-57e1-b349-e538c4796369';  -- Fronting & Information Structure
update quizzes set slug = 'formal-connectors' where id = 'b71e930a-d2d5-510a-92e7-434dfd91181c';  -- Formal Connectors: Nonetheless, Notwithstanding, Whereas
commit;

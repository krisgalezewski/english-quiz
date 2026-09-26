-- Migration 015: Function Words quizzes link to the free course previews
--
-- The "Want to go further?" link on the 22 Function Words lesson quizzes now
-- points at englishvoiced.com/courses/english-plus-function-words-1/ and -2/:
-- the Lesson 1 quizzes open Lesson 1 in the preview; every other quiz opens
-- the preview's course page with ?locked=N, which says that lesson is part
-- of the full course and how to contact Kris. Only these 3 columns on these
-- 22 quizzes (fixed ids) change. Safe to run more than once. (The seed files
-- seed-lesson-quizzes-english-plus-function-words-*.sql carry the same links.)

begin;
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 1 of the English+ Function Words I course (B1+/B2), and that lesson is free to try.',
  learn_more_link_text = 'Open Lesson 1 free', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/lesson-01-preview-standalone.html'
  where id = 'b440f71f-2800-5f0e-8a77-2a4a91bb78f6';  -- Personal, Possessive & Reflexive Pronouns
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 2 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=2'
  where id = 'b3c8e206-87c3-5ad8-b566-fa3bcec87995';  -- Demonstratives & Indefinite Pronouns
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 3 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=3'
  where id = '4593f2a0-76d8-5308-960d-a31929efde17';  -- Each, Every, Either, Neither & Each Other
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 4 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=4'
  where id = '7d4b7a56-1612-56fe-929d-feecd2691283';  -- Who, Which, That, Whose — plus Question Tags
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 5 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=5'
  where id = '0146c7e0-93fc-5eb8-b64d-c6182bdf3918';  -- In, On, At — Time & Place
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 6 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=6'
  where id = 'dcd390d1-0835-5bd2-8fdb-f6296ed927e9';  -- Dependent Prepositions
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 7 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=7'
  where id = '40df3ae6-7a11-5a4a-ae2c-35f6c95e7c5d';  -- A First Look at Phrasal Verb Particles
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 8 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=8'
  where id = '06fa64d9-7a61-50a9-9a98-72cf2c421304';  -- And, But, Or, So — plus Both … And, Either … Or, Neither … Nor
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 9 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=9'
  where id = '661e806c-74b8-56e6-a12e-8dded1148a26';  -- Because, Although, While
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 10 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=10'
  where id = 'a6a8f64a-290a-54f8-99ae-4b616f15cfa9';  -- Everyday Connecting Words
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 11 of the English+ Function Words I course (B1+/B2).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-1/?locked=11'
  where id = 'f0fe510e-17ed-5981-ae22-3958bde7d9ce';  -- Quantifiers & Countability
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 1 of the English+ Function Words II course (B2+/C1), and that lesson is free to try.',
  learn_more_link_text = 'Open Lesson 1 free', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/lesson-01-preview-standalone.html'
  where id = 'd6d75263-7c33-5e34-87df-dd2dbd9d45de';  -- Formal Relative Pronouns: By Which, Whom, Whereby
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 2 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=2'
  where id = 'b9d3713f-d3dc-5f8a-9263-d66d43088f71';  -- Generic One and This / That / Such Reference
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 3 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=3'
  where id = '69ccf599-004c-5038-a266-a5e6d6879412';  -- Multi-Word Prepositions: Due To, In Spite Of, With Regard To
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 4 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=4'
  where id = '97154a39-f6e4-54f1-9f90-41f39d4f2854';  -- Stranded Prepositions and Register
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 5 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=5'
  where id = 'fa9f524d-3bab-510a-b08d-129c153ec7f9';  -- Phrasal Verb Particles: Up, Out, Off, Over, Through
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 6 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=6'
  where id = 'f1dfb462-22a4-53d3-97a2-66ed348d70bb';  -- Not Only … But Also, Whereas, Even Though, Given That
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 7 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=7'
  where id = '969ad4c0-09c5-5ffc-8d61-de8074959055';  -- Moreover, Nevertheless, Consequently: Transition Words and Punctuation
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 8 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=8'
  where id = '97180203-0e76-5099-a422-93c46f2c0f8c';  -- Subsequently, Meanwhile, Namely, For Instance: Sequence and Examples
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 9 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=9'
  where id = '951e1368-cd65-57c6-bd75-cd80bb424f81';  -- Formal Quantifiers: A Number Of, The Majority Of, Few vs A Few
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 10 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=10'
  where id = '2cb7ea16-9457-5449-9227-7af3ae9d3ce0';  -- Intensifiers and Degree Words: Very, Absolutely, Rather, Somewhat
update quizzes set learn_more_text = 'Want to go further? This grammar is taught step by step in Lesson 11 of the English+ Function Words II course (B2+/C1).',
  learn_more_link_text = 'See the course', learn_more_url = 'https://englishvoiced.com/courses/english-plus-function-words-2/?locked=11'
  where id = '70466d79-8cf1-586b-bb4c-6d7ce2200576';  -- The Former and the Latter, Respectively, Do So
commit;

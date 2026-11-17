# Curriculum alignment

**References used:**

- *Dokumen Standard Kurikulum dan Pentaksiran (DSKP) KSSR Science Year 2, DLP (Semakan 2017)*, Content and
  Learning Standards, pages 30–52
- *Science Year 2 textbook (DLP)*, Ministry of Education Malaysia, 2017 (third printing 2019)

Every learning-standard code in the app (`standards` on each unit and activity in `src/lib/content`) was checked
against the DSKP. The content validator rejects any code that is not in the DSKP list
(`src/lib/content/validate.ts`). Codes show which standards an activity **supports**. They do not award DSKP
performance levels (Tahap Penguasaan); those remain the teacher's professional judgement.

## Where the DSKP differs from the original brief

Where the brief's unit topics and the DSKP disagreed, the app follows the DSKP, because the brief says the uploaded
DSKP and textbook are the primary references.

| Unit | Brief listed | DSKP / textbook actually contains | What the app does |
|---|---|---|---|
| 1 Scientific Skills | Observing, classifying, measuring, communicating, recording | 1.1.1–1.1.4 process skills **and 1.2.1–1.2.5 manipulative skills** (handle, sketch, clean, store) | Includes both |
| 3 Humans | Growth, stages, physical changes, similarities/differences | Also **3.1.4–3.1.6 inheritance** (iris colour, skin colour, hair type from parents or ancestors) | Includes inheritance |
| 4 Animals | Matches | 4.1.1–4.1.7, including young that look/do not look like their parents | Matches |
| 6 Light and Dark | Natural vs artificial sources, conditions for seeing objects | Sources of light, activities in light vs dark, **shadow formation, clarity of shadows, shadow games** (6.1.1–6.1.6) | Follows the DSKP; “natural source” (the sun) is mentioned as in the textbook. “Conditions to see objects” is not a Year 2 standard, so it is not taught as a separate topic. |
| 7 Electricity | Components, complete/incomplete circuits | Also the **switch**, troubleshooting why a bulb does not light, **conductors and insulators** (7.1.1–7.1.7) | Includes all |
| 8 Mixture | Materials in mixtures, soluble/insoluble, observing changes | **Methods to separate mixtures** (hand-picking, sieving, magnet, floatation, filtration), soluble/insoluble, **dissolving faster** (8.1.1–8.1.5) | Follows the DSKP |
| 9 Earth | Water and air, sources, importance, uses, **conservation of water** | Natural sources, **direction of water flow**, **water cycle**, air composition (oxygen, carbon dioxide), **wind** and its effects (9.1.1–9.2.6) | Follows the DSKP; keeping rivers clean is covered lightly (DSKP 9.1 performance level 6) |
| 2, 5, 10 | Match | Match | Match |

## Units, activities and standards

Each unit has: an introduction, learning objectives, short notes (with read-aloud), Level 1 Foundation,
Level 2 Developing, Level 3 Challenge, a Unit Assessment, and a score summary.

| Unit | Activities (questions) | DSKP learning standards |
|---|---|---|
| 1 Scientific Skills | My Five Senses (6) · Sort It Out! (6) · Think Like a Scientist (5) · Assessment (6) | 1.1.1–1.1.4, 1.2.1–1.2.5 |
| 2 Science Room Rules | Safe or Not Safe? (6) · Rule Detectives (6) · What Should They Do? (5) · Assessment (6) | 2.1.1 |
| 3 Humans | I Am Growing (6) · Same or Different? (6) · Family Features (5) · Assessment (6) | 3.1.1–3.1.6 |
| 4 Animals | Eggs or Babies? (6) · Animal Groups and Life Cycles (6) · Animal Detectives (5) · Assessment (6) | 4.1.1–4.1.7 |
| 5 Plants | Why We Need Plants (6) · Watch It Grow (6) · Plant Investigators (5) · Assessment (6) | 5.1.1–5.1.6 |
| 6 Light and Dark | Find the Light (6) · Shadow Lab (6) · Shadow Puzzles (5) · Assessment (6) | 6.1.1–6.1.6 |
| 7 Electricity | Circuit Parts (6) · Conductor or Insulator? (6) · Junior Electrician (5) · Assessment (6) | 7.1.1–7.1.7 |
| 8 Mixture | Mix and Separate (6) · Dissolve Detectives (6) · Mixture Problem Solvers (5) · Assessment (6) | 8.1.1–8.1.5 |
| 9 Earth | Water and Air Around Us (6) · The Water Cycle (6) · Earth Thinkers (5) · Assessment (6) | 9.1.1–9.1.5, 9.2.1–9.2.6 |
| 10 Technology | Meet the Building Set (6) · Junior Engineer (6) · Creative Builder (5) · Assessment (6) | 10.1.1–10.1.6 |

**Total: 40 activities, 230 questions.** Every unit uses all 7 question types.

## How the levels differ

- **Level 1 Foundation:** recognise and identify. Picture matching, yes/no, multiple choice with large pictures,
  short sentences, read-aloud on every question.
- **Level 2 Developing:** classify, sequence, compare and complete. Sorting into groups, ordering life cycles and
  steps, fill-in-the-blanks, reading simple tables.
- **Level 3 Challenge:** apply and reason. Investigation set-ups (e.g. the four plants with missing needs),
  predicting outcomes, troubleshooting a circuit, choosing a separation plan and explaining why. These questions
  ask *why* or *what will happen*, rather than being longer versions of Level 1.
- **Unit Assessment:** mixed questions across the unit's standards, modelled on the textbook's *I Answer* sections.

## Content decisions worth knowing

- Facts follow the textbook where it is explicit: for example, the crocodile is listed as laying many eggs, the
  frog life cycle includes the froglet, and the cow life cycle is calf → yearling → cow.
- Some textbook items are scientifically ambiguous, so the app avoids them: whether fireflies are a light source,
  pencil lead as an insulator (graphite conducts), and the shadow of clear glass.
- The moon is taught as *not* a source of light (it reflects sunlight). Seeds are taught as *not* needing sunlight
  to germinate (DSKP 5.1.2: water, air and suitable temperature).
- Pupil names in the questions reflect Malaysian classrooms (Nisa, Kanang, Kugan, Mei Ling, Aina, Siti …), following
  the textbook.

Teachers should still review the questions before classroom use. Every question, its answer and its explanation are
in plain TypeScript and can be edited (see README → *Editing content*).

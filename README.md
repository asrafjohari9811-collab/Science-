# Science Quest – Year 2

**Explore. Learn. Discover.**

An interactive English-language (DLP) science learning platform for Malaysian Year 2 pupils, based on the
KSSR Science Year 2 curriculum (Revised 2017). It includes pupil and teacher portals, automatic save and resume,
offline-friendly saving, and teacher progress tracking with charts and CSV/Excel export.

## What's inside

| Area | Details |
|---|---|
| Content | 10 units · 40 activities (Level 1 Foundation, Level 2 Developing, Level 3 Challenge, Unit Assessment per unit) · 230 questions · 7 interactive question types (multiple choice, yes/no, select-all, matching, drag/tap sorting, sequencing, fill-in-the-blanks) |
| Pupil portal | Student ID + secret code login, unit grid with colour-coded status, learning notes with read-aloud, instant feedback with explanations, stars and badges, “Welcome back” resume, answer review |
| Saving | Every answer is saved on the device first, then sent to Supabase. The server functions are idempotent, refuse out-of-order answers and never overwrite a saved answer. Pupils continue from the exact next question on any device. |
| Teacher dashboard | Class overview, charts (completion and scores by unit, pupil comparison, most challenging units), searchable/sortable records table (Units 1–10), “who has not attempted” finder, individual reports with answer history, CSV + Excel export, print-friendly reports, class and pupil account management with printable login cards |
| Security | Supabase Auth, role-based access, row level security on every table, progress written only through `security definer` functions, answer keys hidden from pupils, service-role key used only on the server |

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Auth + PostgreSQL + RLS) · Recharts · SheetJS (Excel export)

## Quick start

```bash
npm install
cp .env.example .env.local        # fill in your Supabase URL and keys
# In Supabase SQL Editor, run supabase/setup_all.sql (schema, functions, security, all content)
npm run setup:teacher -- you@school.edu.my "Cikgu Aminah" "2 Arif"
npm run setup:sample-students -- you@school.edu.my "2 Arif"
npm run dev                         # http://localhost:3000
```

Full instructions: **[docs/SETUP.md](docs/SETUP.md)** · Deployment: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** ·
Testing: **[docs/TESTING.md](docs/TESTING.md)** · Curriculum mapping: **[docs/CURRICULUM_ALIGNMENT.md](docs/CURRICULUM_ALIGNMENT.md)**

## Project layout

```
src/
  app/
    page.tsx                     Landing (choose Pupil / Teacher)
    login/                       Pupil login (Student ID + secret code, "Are you …?" check)
    (student)/dashboard          Pupil dashboard + "Welcome back!" resume dialog
    (student)/units/[unitId]     Unit intro, objectives, notes, activities, score summary
    (student)/learn/[activityId] Activity player (save after every answer) + /review
    teacher/login                Teacher login
    teacher/(app)/               Overview, Student Records, Student report, Classes & Accounts
    api/teacher/students         Create pupils / reset code / remove (server-only, service role)
  components/                    UI, question types, student + teacher components
  lib/content/                   All curriculum content (TypeScript, single source of truth)
  lib/sync/                      Offline save queue + Supabase transport
  lib/grading.ts, progress.ts, report.ts
supabase/
  migrations/                    Schema, functions (start_attempt, submit_answer, grading), RLS
  seed/content.sql               Generated from src/lib/content (npm run content:sql)
  setup_all.sql                  Everything above in one file for the SQL Editor
scripts/                         Content SQL generator, teacher + sample pupil setup, DB tests
tests/                           Unit tests (content, grading, sync) and database acceptance tests
```

## Editing content

All questions live in `src/lib/content/units/u01.ts … u10.ts`. After editing:

```bash
npm test               # validates every question and answer key
npm run content:sql    # regenerates supabase/seed/content.sql
```

Then run `supabase/seed/content.sql` in the Supabase SQL Editor. Questions that pupils have already answered are kept so reports stay intact.

-- Science Quest Year 2 — schema
-- Tables: profiles (users), classes, students, units, activities, questions, question_keys,
--         activity_attempts, attempt_answers, student_progress, scores

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Users and classes
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('teacher', 'student');

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null,
  full_name   text not null check (length(trim(full_name)) between 1 and 120),
  created_at  timestamptz not null default now()
);
comment on table public.profiles is 'One row per signed-in user (teacher or student). Role drives all access rules.';

create table public.classes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 1 and 60),
  teacher_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (teacher_id, name)
);

create table public.students (
  id            uuid primary key references public.profiles (id) on delete cascade,
  student_code  text not null unique check (student_code ~ '^[A-Z0-9][A-Z0-9-]{2,19}$'),
  full_name     text not null check (length(trim(full_name)) between 1 and 120),
  class_id      uuid references public.classes (id) on delete set null,
  created_at    timestamptz not null default now()
);
create index students_class_idx on public.students (class_id);

-- ---------------------------------------------------------------------------
-- Curriculum content (generated from src/lib/content by scripts/generate-content-sql.ts)
-- ---------------------------------------------------------------------------
create table public.units (
  id          smallint primary key,
  slug        text not null unique,
  title       text not null,
  theme       text not null,
  sort_order  smallint not null
);

create table public.activities (
  id              text primary key,             -- e.g. 'u04-l2', 'u04-as'
  unit_id         smallint not null references public.units (id) on delete cascade,
  level           smallint not null check (level between 1 and 4), -- 4 = unit assessment
  title           text not null,
  question_count  smallint not null check (question_count > 0),
  standards       text[] not null default '{}',
  sort_order      smallint not null
);
create index activities_unit_idx on public.activities (unit_id);

create table public.questions (
  id           text primary key,                -- e.g. 'u04-l2-q03'
  activity_id  text not null references public.activities (id) on delete cascade,
  position     smallint not null check (position > 0),
  type         text not null check (type in ('mcq', 'yesno', 'multi', 'match', 'sort', 'sequence', 'fill')),
  prompt       text not null,
  data         jsonb not null default '{}',     -- options/items for display (no answers)
  unique (activity_id, position)
);

-- Answer keys are kept apart so students can never read them through the API.
create table public.question_keys (
  question_id  text primary key references public.questions (id) on delete cascade,
  answer       jsonb not null,
  explanation  text not null
);

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------
create table public.activity_attempts (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.students (id) on delete cascade,
  activity_id      text not null references public.activities (id) on delete cascade,
  attempt_no       int not null check (attempt_no > 0),
  status           text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  current_index    smallint not null default 0 check (current_index >= 0), -- next question to answer (0-based)
  total_questions  smallint not null check (total_questions > 0),
  correct_count    smallint not null default 0,
  incorrect_count  smallint not null default 0,
  started_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  completed_at     timestamptz,
  unique (student_id, activity_id, attempt_no),
  check (current_index <= total_questions),
  check (correct_count + incorrect_count = current_index)
);
-- At most one unfinished attempt per student per activity.
create unique index one_open_attempt_idx on public.activity_attempts (student_id, activity_id) where status = 'in_progress';
create index attempts_student_idx on public.activity_attempts (student_id, updated_at desc);

create table public.attempt_answers (
  id               bigint generated always as identity primary key,
  attempt_id       uuid not null references public.activity_attempts (id) on delete cascade,
  student_id       uuid not null references public.students (id) on delete cascade,
  question_id      text not null references public.questions (id),
  question_index   smallint not null check (question_index >= 0),
  response         jsonb not null,
  is_correct       boolean not null,
  client_event_id  uuid not null unique,          -- idempotency key from the device
  answered_at      timestamptz not null,          -- device time (clamped to server time)
  received_at      timestamptz not null default now(),
  unique (attempt_id, question_index)             -- an answer is never overwritten
);
create index answers_student_idx on public.attempt_answers (student_id);

-- One summary row per student per activity, kept up to date by the save functions.
create table public.student_progress (
  student_id           uuid not null references public.students (id) on delete cascade,
  activity_id          text not null references public.activities (id) on delete cascade,
  unit_id              smallint not null references public.units (id),
  level                smallint not null,
  status               text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  current_attempt_id   uuid references public.activity_attempts (id) on delete set null,
  last_question_index  smallint,                  -- index of the last saved question (0-based)
  questions_attempted  int not null default 0,    -- answers submitted, all attempts
  questions_completed  int not null default 0,    -- answered in the latest attempt
  correct_answers      int not null default 0,    -- latest attempt
  incorrect_answers    int not null default 0,    -- latest attempt
  total_score          int not null default 0,    -- latest attempt score
  best_score           int not null default 0,
  best_percentage      numeric(5, 2) not null default 0,
  completion_pct       numeric(5, 2) not null default 0,
  total_attempts       int not null default 0,
  last_activity_at     timestamptz,
  primary key (student_id, activity_id)
);
create index progress_unit_idx on public.student_progress (student_id, unit_id);

create table public.scores (
  id           bigint generated always as identity primary key,
  student_id   uuid not null references public.students (id) on delete cascade,
  activity_id  text not null references public.activities (id) on delete cascade,
  attempt_id   uuid not null unique references public.activity_attempts (id) on delete cascade,
  score        int not null,
  max_score    int not null,
  percentage   numeric(5, 2) not null,
  stars        smallint not null check (stars between 1 and 3),
  completed_at timestamptz not null default now()
);
create index scores_student_idx on public.scores (student_id, completed_at desc);

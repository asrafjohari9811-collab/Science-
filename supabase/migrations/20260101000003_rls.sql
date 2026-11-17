-- Science Quest Year 2 — row level security.
-- Students: read their own rows only. Teachers: read rows of students in classes they own.
-- No client can write to progress tables directly; all writes go through the functions.

alter table public.profiles          enable row level security;
alter table public.classes           enable row level security;
alter table public.students          enable row level security;
alter table public.units             enable row level security;
alter table public.activities        enable row level security;
alter table public.questions         enable row level security;
alter table public.question_keys     enable row level security;
alter table public.activity_attempts enable row level security;
alter table public.attempt_answers   enable row level security;
alter table public.student_progress  enable row level security;
alter table public.scores            enable row level security;

-- Start from nothing for the public roles, then grant only what is needed.
revoke all on all tables in schema public from anon, authenticated;
grant select on public.profiles, public.classes, public.students, public.units, public.activities, public.questions,
                public.question_keys, public.activity_attempts, public.attempt_answers, public.student_progress, public.scores
  to authenticated;
grant insert, update, delete on public.classes to authenticated;
grant update (full_name, class_id) on public.students to authenticated;

-- profiles
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: teacher reads own students" on public.profiles
  for select to authenticated using (public.teacher_owns_student(id));

-- classes
create policy "classes: teacher manages own" on public.classes
  for all to authenticated
  using (teacher_id = auth.uid() and public.is_teacher())
  with check (teacher_id = auth.uid() and public.is_teacher());
create policy "classes: student reads own class" on public.classes
  for select to authenticated using (id = public.my_class_id());

-- students
create policy "students: read self" on public.students
  for select to authenticated using (id = auth.uid());
create policy "students: teacher reads own" on public.students
  for select to authenticated using (public.teacher_owns_student(id));
create policy "students: teacher updates own" on public.students
  for update to authenticated
  using (public.teacher_owns_student(id))
  with check (class_id in (select id from public.classes where teacher_id = auth.uid()));

-- curriculum content: readable by any signed-in user
create policy "units: read" on public.units for select to authenticated using (true);
create policy "activities: read" on public.activities for select to authenticated using (true);
create policy "questions: read" on public.questions for select to authenticated using (true);
-- answer keys: teachers only (students get feedback from the app and from submit_answer)
create policy "question_keys: teachers read" on public.question_keys for select to authenticated using (public.is_teacher());

-- progress tables: read-only for clients
create policy "attempts: read own" on public.activity_attempts
  for select to authenticated using (student_id = auth.uid() or public.teacher_owns_student(student_id));
create policy "answers: read own" on public.attempt_answers
  for select to authenticated using (student_id = auth.uid() or public.teacher_owns_student(student_id));
create policy "progress: read own" on public.student_progress
  for select to authenticated using (student_id = auth.uid() or public.teacher_owns_student(student_id));
create policy "scores: read own" on public.scores
  for select to authenticated using (student_id = auth.uid() or public.teacher_owns_student(student_id));

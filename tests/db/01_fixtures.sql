-- Test fixtures: one teacher, one class, two students, plus a second teacher with their own pupil.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'teacher@school.test'),
  ('00000000-0000-0000-0000-0000000000a2', 'other.teacher@school.test'),
  ('00000000-0000-0000-0000-0000000000b1', 'sq-2a-001@students.sciencequest.app'),
  ('00000000-0000-0000-0000-0000000000b2', 'sq-2a-002@students.sciencequest.app'),
  ('00000000-0000-0000-0000-0000000000b3', 'sq-2b-001@students.sciencequest.app');

insert into public.profiles (id, role, full_name) values
  ('00000000-0000-0000-0000-0000000000a1', 'teacher', 'Cikgu Aminah'),
  ('00000000-0000-0000-0000-0000000000a2', 'teacher', 'Mr Lim'),
  ('00000000-0000-0000-0000-0000000000b1', 'student', 'Aisyah'),
  ('00000000-0000-0000-0000-0000000000b2', 'student', 'Kanang'),
  ('00000000-0000-0000-0000-0000000000b3', 'student', 'Mei Ling');

insert into public.classes (id, name, teacher_id) values
  ('00000000-0000-0000-0000-0000000000c1', '2 Arif', '00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000c2', '2 Bestari', '00000000-0000-0000-0000-0000000000a2');

insert into public.students (id, student_code, full_name, class_id) values
  ('00000000-0000-0000-0000-0000000000b1', 'SQ-2A-001', 'Aisyah', '00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000b2', 'SQ-2A-002', 'Kanang', '00000000-0000-0000-0000-0000000000c1'),
  ('00000000-0000-0000-0000-0000000000b3', 'SQ-2B-001', 'Mei Ling', '00000000-0000-0000-0000-0000000000c2');

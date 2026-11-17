-- Acceptance tests from the brief (TEST 1–6), run against the real migrations.
-- Run with: bash scripts/test-db.sh
\set ON_ERROR_STOP on
\set QUIET on
\pset tuples_only on

-- Answer keys for the test activity, copied while still superuser (students cannot read question_keys).
create temp table keys as
  select q.position - 1 as idx, k.answer from questions q join question_keys k on k.question_id = q.id where q.activity_id = 'u01-l1';
grant select on keys to authenticated;
create temp table t_state (k text primary key, v text);
grant all on t_state to authenticated;

-- =========================================================================
-- TEST 1: a student logs in and completes 5 questions (one wrong on purpose).
-- =========================================================================
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);
set role authenticated;
do $$
declare r jsonb; att uuid; i int; resp jsonb;
begin
  r := start_attempt('u01-l1');
  assert r->>'status' = 'started', 'expected a new attempt, got ' || r;
  att := (r->'state'->>'attempt_id')::uuid;
  insert into t_state values ('attempt', att::text);

  for i in 0..4 loop
    select answer into resp from keys where idx = i;
    if i = 2 then resp := '{"value":"zzz"}'; end if;           -- deliberate wrong answer
    r := submit_answer(att, i, resp, gen_random_uuid(), now());
    assert r->>'status' = 'ok', 'save failed: ' || r;
    assert (r->>'is_correct')::boolean = (i <> 2), 'grading wrong at q' || i;
  end loop;
  assert (r->'state'->>'current_index')::int = 5, 'current_index should be 5';
  assert (r->'state'->>'correct_count')::int = 4;
  raise notice 'TEST 1 passed: 5 questions saved, score 4/5';
end $$;

-- Retry of the same answer (offline queue sends it twice) must not double count.
do $$
declare r jsonb; att uuid := (select v::uuid from t_state where k = 'attempt'); ev uuid := gen_random_uuid(); resp jsonb;
begin
  select answer into resp from keys where idx = 5;
  -- Out-of-order (question 7 before 6) is rejected and changes nothing.
  r := submit_answer(att, 6, resp, gen_random_uuid());
  assert r->>'status' = 'out_of_order', 'expected out_of_order: ' || r;
  -- Re-sending an old question with a new answer does not overwrite it.
  r := submit_answer(att, 0, '{"value":"zzz"}', gen_random_uuid());
  assert r->>'status' = 'already_answered' and (r->>'is_correct')::boolean, 'old answer was overwritten: ' || r;
  assert (r->'state'->>'current_index')::int = 5;
  raise notice 'Sync safety passed: out-of-order rejected, saved answers never overwritten';
end $$;

-- =========================================================================
-- TEST 2 + 3: the student exits, logs in again (new session) and resumes.
-- =========================================================================
reset role;
select set_config('request.jwt.claim.sub', '', false);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b1', false);
set role authenticated;
do $$
declare r jsonb; p record;
begin
  -- What the dashboard reads to show "Welcome back! Would you like to continue where you left off?"
  select * into p from student_progress where activity_id = 'u01-l1';
  assert p.status = 'in_progress' and p.questions_completed = 5 and p.last_question_index = 4, 'progress row wrong';

  r := start_attempt('u01-l1');                                  -- "Continue Learning"
  assert r->>'status' = 'resumed', 'should resume, got ' || r;
  assert (r->'state'->>'attempt_id') = (select v from t_state where k = 'attempt'), 'resumed a different attempt';
  assert (r->'state'->>'current_index')::int = 5, 'should continue at question 6 (index 5)';
  assert jsonb_array_length(r->'state'->'answers') = 5, 'previous answers not preserved';
  assert (r->'state'->>'correct_count')::int = 4, 'score not preserved';
  raise notice 'TEST 3 passed: resumes at question 6 with 5 answers and score 4 preserved';
end $$;

-- =========================================================================
-- TEST 5: same student on another device — sees the same saved state, and an
-- answer queued on device A while offline is applied exactly once.
-- =========================================================================
do $$
declare r jsonb; r2 jsonb; att uuid := (select v::uuid from t_state where k = 'attempt'); ev uuid := gen_random_uuid(); resp jsonb;
begin
  r := start_attempt('u01-l1');                                  -- device B opens the activity
  assert (r->'state'->>'current_index')::int = 5, 'device B does not see latest progress';

  select answer into resp from keys where idx = 5;
  r := submit_answer(att, 5, resp, ev, now() - interval '2 minutes');  -- device A syncs its queued answer
  r2 := submit_answer(att, 5, resp, ev, now() - interval '2 minutes'); -- ...and retries after a timeout
  assert r->>'status' = 'ok' and r2->>'status' = 'duplicate', 'idempotency failed: ' || r2;
  assert (r2->'state'->>'current_index')::int = 6;
  assert (select count(*) from attempt_answers where attempt_id = att) = 6, 'duplicate answer stored';
  raise notice 'TEST 5 passed: progress shared across devices, queued answer applied exactly once';
end $$;

-- That was the last of 6 questions: a score row and stars are written; progress shows Completed.
do $$
declare r jsonb; att uuid := (select v::uuid from t_state where k = 'attempt'); s record; p record;
begin
  r := submit_answer(att, 6, '{"value":"a"}', gen_random_uuid());
  assert r->>'status' = 'closed', 'completed attempt should be closed: ' || r;
  assert (r->'state'->>'status') = 'completed';
  select * into s from scores where attempt_id = att;
  assert s.score = 5 and s.max_score = 6 and s.stars = 3, 'score row wrong';
  select * into p from student_progress where activity_id = 'u01-l1';
  assert p.status = 'completed' and p.completion_pct = 100 and p.best_score = 5 and p.total_attempts = 1;
  raise notice 'Completion passed: score 5/6, 3 stars, status Completed';
end $$;

-- Restart only happens when asked; the old attempt stays in history.
do $$
declare r jsonb; p record;
begin
  r := start_attempt('u01-l2');
  r := start_attempt('u01-l2', null, true);
  assert r->>'status' = 'started' and (r->'state'->>'attempt_no')::int = 2;
  assert (select count(*) from activity_attempts where activity_id = 'u01-l2' and status = 'abandoned') = 1;
  select * into p from student_progress where activity_id = 'u01-l2';
  assert p.total_attempts = 2 and p.status = 'in_progress';
  raise notice 'Restart passed: new attempt only on explicit restart, history kept';
end $$;

-- =========================================================================
-- TEST 6: a student tries to access or change another student's records.
-- =========================================================================
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b2', false);  -- Kanang
set role authenticated;
do $$
declare n int; r jsonb; att uuid := (select v::uuid from t_state where k = 'attempt'); blocked boolean := false;
begin
  select count(*) into n from student_progress where student_id <> auth.uid();
  assert n = 0, 'can read other students progress';
  select count(*) into n from attempt_answers; assert n = 0, 'can read other answers';
  select count(*) into n from scores; assert n = 0, 'can read other scores';
  select count(*) into n from students; assert n = 1, 'can see other student rows';
  select count(*) into n from profiles; assert n = 1, 'can see other profiles';
  select count(*) into n from question_keys; assert n = 0, 'student can read answer keys';

  begin
    r := submit_answer(att, 0, '{"value":"a"}', gen_random_uuid());
  exception when insufficient_privilege then blocked := true;
  end;
  assert blocked, 'student could submit into another student''s attempt';

  blocked := false;
  begin
    update student_progress set total_score = 999;
  exception when insufficient_privilege then blocked := true;
  end;
  assert blocked, 'student could update progress directly';

  blocked := false;
  begin
    insert into scores (student_id, activity_id, attempt_id, score, max_score, percentage, stars)
    values (auth.uid(), 'u01-l1', att, 6, 6, 100, 3);
  exception when insufficient_privilege then blocked := true;
  end;
  assert blocked, 'student could insert a score';
  raise notice 'TEST 6 passed: other students'' records are hidden and cannot be changed';
end $$;

-- =========================================================================
-- TEST 4: the teacher checks the student's record.
-- =========================================================================
reset role;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', false);
set role authenticated;
do $$
declare p record; n int;
begin
  select s.full_name, sp.questions_completed, sp.total_score, sp.completion_pct, sp.last_activity_at, sp.status
    into p
    from student_progress sp join students s on s.id = sp.student_id
   where s.student_code = 'SQ-2A-001' and sp.activity_id = 'u01-l1';
  assert p.full_name = 'Aisyah' and p.questions_completed = 6 and p.total_score = 5 and p.completion_pct = 100
     and p.last_activity_at is not null and p.status = 'completed', 'teacher view wrong';
  select count(*) into n from attempt_answers; assert n > 0, 'teacher cannot see answers';
  select count(*) into n from students; assert n = 2, 'teacher should see exactly their 2 students';
  select count(*) into n from students where student_code = 'SQ-2B-001'; assert n = 0, 'teacher sees another teacher''s pupil';
  select count(*) into n from question_keys; assert n > 0, 'teacher should read answer keys';
  raise notice 'TEST 4 passed: teacher sees name, completed questions, score, progress %% and last active';
end $$;

-- A teacher cannot move a pupil into another teacher's class, or start activities.
do $$
declare blocked boolean := false; n int;
begin
  update students set class_id = '00000000-0000-0000-0000-0000000000c2' where student_code = 'SQ-2A-002';
  get diagnostics n = row_count;
  assert false, 'teacher moved pupil into another class';
exception
  when insufficient_privilege or check_violation then raise notice 'Teacher scope passed';
  when assert_failure then raise;
  when others then
    if sqlerrm like '%row-level security%' then raise notice 'Teacher scope passed'; else raise; end if;
end $$;

reset role;
\echo 'All database tests passed.'

-- Grader parity: every answer key grades as correct; order rules behave like src/lib/grading.ts.
do $$
declare n int;
begin
  select count(*) into n from question_keys where not sq_grade(answer, answer);
  assert n = 0, n || ' answer keys do not grade as correct';
  assert sq_grade('{"values":["a","c"]}', '{"values":["c","a"]}'), 'multi should ignore order';
  assert not sq_grade('{"values":["a","c"]}', '{"values":["a"]}'), 'multi partial should be wrong';
  assert not sq_grade('{"order":["s1","s2","s3"]}', '{"order":["s2","s1","s3"]}'), 'sequence order matters';
  assert sq_grade('{"blanks":["cm","kg"]}', '{"blanks":[" CM","kg"]}'), 'fill ignores case/space';
  assert sq_grade('{"pairs":{"la":"ra","lb":"rb"}}', '{"pairs":{"lb":"rb","la":"ra"}}'), 'pairs ignore key order';
  assert not sq_grade('{"value":"a"}', '"a"'), 'non-object response must be wrong';
  assert not sq_grade('{"values":["a"]}', '{"values":"a"}'), 'malformed response must be wrong';
  raise notice 'Grader parity passed for all % answer keys', (select count(*) from question_keys);
end $$;
\echo 'Grader checks passed.'

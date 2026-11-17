-- Science Quest Year 2 — helper functions, grading and the save/resume API.
-- All writes to progress tables go through start_attempt() and submit_answer().
-- Clients have no INSERT/UPDATE/DELETE rights on progress tables (see the RLS migration),
-- so a student cannot change scores or touch another student's records.

-- ---------------------------------------------------------------------------
-- Role helpers (security definer so they can be used inside RLS policies)
-- ---------------------------------------------------------------------------
create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'teacher');
$$;

create or replace function public.is_student()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from students where id = auth.uid());
$$;

create or replace function public.teacher_owns_student(p_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from students s join classes c on c.id = s.class_id
    where s.id = p_student and c.teacher_id = auth.uid()
  ) and public.is_teacher();
$$;

create or replace function public.my_class_id()
returns uuid language sql stable security definer set search_path = public as $$
  select class_id from students where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Grading. Mirrors src/lib/grading.ts. Answer/response shapes:
--   {"value": "a"} | {"values": [..]} | {"pairs": {..}} | {"groups": {..}} | {"order": [..]} | {"blanks": [..]}
-- ---------------------------------------------------------------------------
create or replace function public.sq_grade(p_answer jsonb, p_response jsonb)
returns boolean language plpgsql immutable set search_path = public as $$
begin
  if p_response is null or jsonb_typeof(p_response) <> 'object' then
    return false;
  end if;

  if p_answer ? 'value' then
    return (p_response ->> 'value') is not distinct from (p_answer ->> 'value');

  elsif p_answer ? 'values' then
    if jsonb_typeof(p_response -> 'values') <> 'array' then return false; end if;
    return (select coalesce(array_agg(distinct v order by v), '{}') from jsonb_array_elements_text(p_response -> 'values') v)
         = (select coalesce(array_agg(distinct v order by v), '{}') from jsonb_array_elements_text(p_answer -> 'values') v);

  elsif p_answer ? 'pairs' then
    return (p_response -> 'pairs') = (p_answer -> 'pairs');

  elsif p_answer ? 'groups' then
    return (p_response -> 'groups') = (p_answer -> 'groups');

  elsif p_answer ? 'order' then
    return (p_response -> 'order') = (p_answer -> 'order');

  elsif p_answer ? 'blanks' then
    if jsonb_typeof(p_response -> 'blanks') <> 'array' then return false; end if;
    return (select array_agg(lower(trim(v)) order by n) from jsonb_array_elements_text(p_response -> 'blanks') with ordinality t(v, n))
         = (select array_agg(lower(trim(v)) order by n) from jsonb_array_elements_text(p_answer -> 'blanks') with ordinality t(v, n));
  end if;

  return false;
end;
$$;

create or replace function public.sq_stars(p_score int, p_max int)
returns smallint language sql immutable as $$
  select case when p_max <= 0 then 1
              when p_score * 100 >= p_max * 80 then 3
              when p_score * 100 >= p_max * 50 then 2
              else 1 end::smallint;
$$;

-- ---------------------------------------------------------------------------
-- Progress summary (one row per student per activity)
-- ---------------------------------------------------------------------------
create or replace function public.sq_refresh_progress(p_student uuid, p_activity text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_act      activities%rowtype;
  v_latest   activity_attempts%rowtype;
  v_open_id  uuid;
  v_attempts int;
  v_answers  int;
  v_done     boolean;
  v_best     int;
  v_best_pct numeric;
  v_last     timestamptz;
begin
  select * into v_act from activities where id = p_activity;

  select * into v_latest from activity_attempts
   where student_id = p_student and activity_id = p_activity and status <> 'abandoned'
   order by attempt_no desc limit 1;

  select id into v_open_id from activity_attempts
   where student_id = p_student and activity_id = p_activity and status = 'in_progress';

  select count(*), max(updated_at) into v_attempts, v_last from activity_attempts
   where student_id = p_student and activity_id = p_activity;

  select count(*) into v_answers from attempt_answers aa
    join activity_attempts at on at.id = aa.attempt_id
   where at.student_id = p_student and at.activity_id = p_activity;

  select coalesce(max(score), 0), coalesce(max(percentage), 0) into v_best, v_best_pct
    from scores where student_id = p_student and activity_id = p_activity;

  v_done := exists (select 1 from activity_attempts where student_id = p_student and activity_id = p_activity and status = 'completed');

  insert into student_progress as sp (
    student_id, activity_id, unit_id, level, status, current_attempt_id, last_question_index,
    questions_attempted, questions_completed, correct_answers, incorrect_answers, total_score,
    best_score, best_percentage, completion_pct, total_attempts, last_activity_at
  ) values (
    p_student, p_activity, v_act.unit_id, v_act.level,
    case when v_done then 'completed' when v_attempts > 0 then 'in_progress' else 'not_started' end,
    coalesce(v_open_id, v_latest.id),
    nullif(coalesce(v_latest.current_index, 0), 0) - 1,
    v_answers,
    coalesce(v_latest.current_index, 0),
    coalesce(v_latest.correct_count, 0),
    coalesce(v_latest.incorrect_count, 0),
    coalesce(v_latest.correct_count, 0),
    v_best, v_best_pct,
    case when v_done then 100
         when v_latest.id is null then 0
         else round(v_latest.current_index * 100.0 / v_latest.total_questions, 2) end,
    v_attempts,
    v_last
  )
  on conflict (student_id, activity_id) do update set
    status = excluded.status,
    current_attempt_id = excluded.current_attempt_id,
    last_question_index = excluded.last_question_index,
    questions_attempted = excluded.questions_attempted,
    questions_completed = excluded.questions_completed,
    correct_answers = excluded.correct_answers,
    incorrect_answers = excluded.incorrect_answers,
    total_score = excluded.total_score,
    best_score = excluded.best_score,
    best_percentage = excluded.best_percentage,
    completion_pct = excluded.completion_pct,
    total_attempts = excluded.total_attempts,
    last_activity_at = excluded.last_activity_at;
end;
$$;

-- Full state of one attempt, returned to the device after every call.
create or replace function public.sq_attempt_state(p_attempt uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'attempt_id', a.id,
    'activity_id', a.activity_id,
    'attempt_no', a.attempt_no,
    'status', a.status,
    'current_index', a.current_index,
    'total_questions', a.total_questions,
    'correct_count', a.correct_count,
    'incorrect_count', a.incorrect_count,
    'started_at', a.started_at,
    'updated_at', a.updated_at,
    'completed_at', a.completed_at,
    'answers', coalesce((
      select jsonb_agg(jsonb_build_object(
        'question_index', aa.question_index, 'question_id', aa.question_id,
        'response', aa.response, 'is_correct', aa.is_correct, 'answered_at', aa.answered_at
      ) order by aa.question_index)
      from attempt_answers aa where aa.attempt_id = a.id), '[]'::jsonb)
  )
  from activity_attempts a where a.id = p_attempt;
$$;

-- ---------------------------------------------------------------------------
-- start_attempt: resume the open attempt, or start a new one.
--   p_client_attempt_id: id created on the device (lets a device start offline and sync later;
--                        calling again with the same id is safe).
--   p_restart:           true only when the pupil explicitly chooses "Start again".
-- ---------------------------------------------------------------------------
create or replace function public.start_attempt(
  p_activity_id text,
  p_client_attempt_id uuid default null,
  p_restart boolean default false
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student uuid := auth.uid();
  v_act     activities%rowtype;
  v_row     activity_attempts%rowtype;
  v_new_id  uuid;
begin
  if v_student is null or not exists (select 1 from students where id = v_student) then
    raise exception 'Only students can start activities' using errcode = '42501';
  end if;

  select * into v_act from activities where id = p_activity_id;
  if not found then
    raise exception 'Unknown activity %', p_activity_id using errcode = 'P0002';
  end if;

  -- Same device retrying: return what we already have.
  if p_client_attempt_id is not null then
    select * into v_row from activity_attempts where id = p_client_attempt_id;
    if found then
      if v_row.student_id <> v_student or v_row.activity_id <> p_activity_id then
        raise exception 'Not allowed' using errcode = '42501';
      end if;
      return jsonb_build_object('status', 'existing', 'state', sq_attempt_state(v_row.id));
    end if;
  end if;

  -- Serialise starts for this student + activity.
  perform pg_advisory_xact_lock(hashtext(v_student::text || ':' || p_activity_id));

  select * into v_row from activity_attempts
   where student_id = v_student and activity_id = p_activity_id and status = 'in_progress'
   for update;

  if found and not p_restart and p_client_attempt_id is null then
    return jsonb_build_object('status', 'resumed', 'state', sq_attempt_state(v_row.id));
  end if;

  if found then
    -- Explicit restart, or a device that started this activity while offline.
    -- The old attempt and its answers are kept for the teacher's history.
    update activity_attempts set status = 'abandoned', updated_at = now() where id = v_row.id;
  end if;

  v_new_id := coalesce(p_client_attempt_id, gen_random_uuid());
  insert into activity_attempts (id, student_id, activity_id, attempt_no, total_questions)
  values (
    v_new_id, v_student, p_activity_id,
    coalesce((select max(attempt_no) from activity_attempts where student_id = v_student and activity_id = p_activity_id), 0) + 1,
    v_act.question_count
  );

  perform sq_refresh_progress(v_student, p_activity_id);
  return jsonb_build_object('status', 'started', 'state', sq_attempt_state(v_new_id));
end;
$$;

-- ---------------------------------------------------------------------------
-- submit_answer: save one answer. Safe to call again with the same p_client_event_id
-- (offline queue retries). Never overwrites an answer that is already saved.
-- Returns status: ok | duplicate | already_answered | out_of_order | closed | not_found
-- ---------------------------------------------------------------------------
create or replace function public.submit_answer(
  p_attempt_id uuid,
  p_question_index int,
  p_response jsonb,
  p_client_event_id uuid,
  p_answered_at timestamptz default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_student  uuid := auth.uid();
  v_att      activity_attempts%rowtype;
  v_existing attempt_answers%rowtype;
  v_qid      text;
  v_key      jsonb;
  v_correct  boolean;
  v_next     int;
  v_done     boolean;
  v_score    int;
begin
  if v_student is null then
    raise exception 'Not signed in' using errcode = '42501';
  end if;
  if p_client_event_id is null then
    raise exception 'client_event_id is required' using errcode = '22023';
  end if;
  if p_response is null or jsonb_typeof(p_response) <> 'object' or pg_column_size(p_response) > 8000 then
    raise exception 'Invalid response' using errcode = '22023';
  end if;

  select * into v_att from activity_attempts where id = p_attempt_id for update;
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;
  if v_att.student_id <> v_student then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  -- Retry of an event we already stored (checked after the lock, so concurrent retries are safe).
  select * into v_existing from attempt_answers where client_event_id = p_client_event_id;
  if found then
    return jsonb_build_object('status', 'duplicate', 'is_correct', v_existing.is_correct, 'state', sq_attempt_state(v_existing.attempt_id));
  end if;

  if v_att.status <> 'in_progress' then
    return jsonb_build_object('status', 'closed', 'state', sq_attempt_state(v_att.id));
  end if;

  if p_question_index < v_att.current_index then
    -- Already answered (e.g. on another device). Keep the saved answer.
    select * into v_existing from attempt_answers where attempt_id = v_att.id and question_index = p_question_index;
    return jsonb_build_object('status', 'already_answered', 'is_correct', v_existing.is_correct, 'state', sq_attempt_state(v_att.id));
  end if;

  if p_question_index > v_att.current_index then
    return jsonb_build_object('status', 'out_of_order', 'state', sq_attempt_state(v_att.id));
  end if;

  select q.id, k.answer into v_qid, v_key
    from questions q join question_keys k on k.question_id = q.id
   where q.activity_id = v_att.activity_id and q.position = p_question_index + 1;
  if not found then
    raise exception 'Question % not found in %', p_question_index, v_att.activity_id using errcode = 'P0002';
  end if;

  v_correct := sq_grade(v_key, p_response);

  insert into attempt_answers (attempt_id, student_id, question_id, question_index, response, is_correct, client_event_id, answered_at)
  values (v_att.id, v_student, v_qid, p_question_index, p_response, v_correct, p_client_event_id,
          least(coalesce(p_answered_at, now()), now()));

  v_next := v_att.current_index + 1;
  v_done := v_next >= v_att.total_questions;

  update activity_attempts set
    current_index   = v_next,
    correct_count   = correct_count + case when v_correct then 1 else 0 end,
    incorrect_count = incorrect_count + case when v_correct then 0 else 1 end,
    status          = case when v_done then 'completed' else 'in_progress' end,
    completed_at    = case when v_done then now() else null end,
    updated_at      = now()
  where id = v_att.id
  returning correct_count into v_score;

  if v_done then
    insert into scores (student_id, activity_id, attempt_id, score, max_score, percentage, stars)
    values (v_student, v_att.activity_id, v_att.id, v_score, v_att.total_questions,
            round(v_score * 100.0 / v_att.total_questions, 2), sq_stars(v_score, v_att.total_questions));
  end if;

  perform sq_refresh_progress(v_student, v_att.activity_id);

  return jsonb_build_object('status', 'ok', 'is_correct', v_correct, 'completed', v_done, 'state', sq_attempt_state(v_att.id));
end;
$$;

-- ---------------------------------------------------------------------------
-- Function permissions
-- ---------------------------------------------------------------------------
revoke all on function public.sq_refresh_progress(uuid, text) from public;
revoke all on function public.sq_attempt_state(uuid) from public;
revoke all on function public.start_attempt(text, uuid, boolean) from public;
revoke all on function public.submit_answer(uuid, int, jsonb, uuid, timestamptz) from public;
grant execute on function public.start_attempt(text, uuid, boolean) to authenticated;
grant execute on function public.submit_answer(uuid, int, jsonb, uuid, timestamptz) to authenticated;
grant execute on function public.is_teacher(), public.is_student(), public.teacher_owns_student(uuid), public.my_class_id() to authenticated;

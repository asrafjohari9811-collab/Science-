# Testing

## Automated tests

```bash
npm test          # content validation, grading, offline sync engine (Node test runner)
npm run test:db   # migrations + acceptance tests on a throwaway PostgreSQL database
```

`npm run test:db` needs a local PostgreSQL 15+ (`psql` on PATH; set `PGHOST`, `PGPORT`, `PGUSER` as needed). It
creates a temporary database and loads a small stand-in for Supabase's `auth` schema
(`tests/db/00_supabase_shim.sql`). It then runs the real migrations and all the content, and drops the database at the end.

### What the tests cover

| Brief scenario | Where it is tested | Result checked |
|---|---|---|
| TEST 1: a pupil completes 5 questions | `tests/db/02_scenarios.sql`, `tests/unit/sync.test.ts` | 5 answers stored, score 4/5, `current_index = 5` |
| TEST 2–3: exit and log in again | same | `start_attempt` resumes the **same attempt** at question 6 with all 5 answers and the score preserved; the dashboard progress row shows `last_question_index = 4` |
| TEST 4: teacher checks the record | `02_scenarios.sql` | Teacher sees name, completed questions, score, completion % and last active time, only for their own classes |
| TEST 5: another device | both | Second device sees the latest state; an answer queued offline on device A is applied exactly once; an old offline answer never overwrites a newer one |
| TEST 6: a pupil accesses another pupil's records | `02_scenarios.sql` | Reads return no rows; `submit_answer` into another pupil's attempt raises *insufficient privilege*; direct `UPDATE`/`INSERT` on progress and scores is refused; answer keys are hidden |
| Extra | | Out-of-order answers rejected; restart only on request (old attempt kept); completion writes a score with stars; the SQL grader matches the TypeScript grader for all 230 answer keys |

## Manual acceptance test (on your Supabase project)

1. Create a teacher and the sample pupils (see SETUP.md).
2. **TEST 1:** Log in as `SQ-TEST-001`, open Unit 1 → Level 1 and answer 5 questions. After each answer you should see
   “Your progress has been saved!”.
3. **TEST 2:** Close the browser tab.
4. **TEST 3:** Log in again as `SQ-TEST-001`. You should see *“Welcome back! Would you like to continue where you left off?”*.
   Press **Continue Learning**: question 6 of 6 opens, with “Welcome back! You are continuing from question 6.”
5. **TEST 4:** In another browser, log in as the teacher → **Student Records**. `SQ-TEST-001` shows Unit 1 *In Progress*,
   the overall %, the average score and **Last Active: Just now**. Open **View report** to see 5 questions done,
   the correct/incorrect answers and the last saved position.
6. **TEST 5:** Log in as `SQ-TEST-001` on a phone. The dashboard shows the same progress and **Continue** opens question 6.
   Try airplane mode in the middle of an activity: answers keep working, and the status says
   “Saved on this device. It will sync when you are online.” Reconnect and the teacher view updates.
7. **TEST 6:** Log in as `SQ-TEST-002`. The dashboard shows only that pupil's own (empty) progress. To check the
   database rules directly, run this in the Supabase **SQL Editor** (it pretends to be `SQ-TEST-002`):
   ```sql
   begin;
   select set_config('request.jwt.claims',
     json_build_object('sub', (select id from public.students where student_code = 'SQ-TEST-002'), 'role', 'authenticated')::text, true);
   set local role authenticated;
   select count(*) from public.student_progress where student_id <> auth.uid();  -- 0
   select count(*) from public.question_keys;                                    -- 0
   update public.student_progress set total_score = 99;                          -- ERROR: permission denied
   rollback;
   ```
   The same rules apply to every request from the app, because the browser only ever has the anon key.

## Checks run while building this version

- TypeScript strict typecheck of all source files
- `npm test`: 11 tests passed
- `npm run test:db` on PostgreSQL 16: all scenarios passed
- Browser run (Chromium) of the real pupil screens against an in-memory copy of the save rules, on desktop and phone sizes:
  answered whole activities using every question type, resumed at question 6 after closing, worked offline and synced
  on reconnect, resumed on a second device, and checked that “Try again” starts a new attempt. No browser console errors.

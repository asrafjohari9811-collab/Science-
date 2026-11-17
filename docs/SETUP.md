# Setup guide

You need: Node.js 20.6 or newer, and a free [Supabase](https://supabase.com) project.

## 1. Create the Supabase project

1. Create a new project in Supabase. Choose the **Southeast Asia (Singapore)** region for the lowest delay in Malaysia.
2. Open **Project Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (server only, never share it)

## 2. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Where it is used | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser + server | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + server (protected by row level security) | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only: creating pupil accounts, resetting codes, setup scripts | Yes, for account management |
| `NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN` | Hidden login email for pupils (`<student id>@<domain>`); no email is ever sent | Optional |

If the public values are missing, the app shows a **Setup needed** notice listing what is missing.
`GET /api/health` also reports missing variables (names only, never values).

## 3. Create the database

In Supabase, open **SQL Editor → New query**, paste the whole of `supabase/setup_all.sql` and press **Run**.

This creates:

- tables: `profiles` (users), `classes`, `students`, `units`, `activities`, `questions`, `question_keys`,
  `activity_attempts`, `attempt_answers`, `student_progress`, `scores`
- functions: `start_attempt`, `submit_answer` (save + grade + update progress), `sq_grade`, role helpers
- row level security policies on every table
- all 10 units, 40 activities and 230 questions

> Using the Supabase CLI instead? `supabase link` then `supabase db push`, and run `supabase/seed/content.sql`.

## 4. Recommended Supabase Auth settings

In **Authentication → Providers → Email** / **Authentication → Settings**:

- **Allow new users to sign up: OFF.** Teachers and pupils are created by the setup script and the teacher dashboard.
  Even if this is left on, a self-registered account has no profile and cannot see any data.
- **Confirm email:** can stay on. Accounts created by the app are confirmed automatically.
- Keep the default **minimum password length of 6**. Pupil secret codes are 6 characters.

## 5. Create a teacher account

```bash
npm install
npm run setup:teacher -- teacher@school.edu.my "Cikgu Aminah" "2 Arif"
```

This prints a temporary password, gives the account the teacher role and creates the class. Running it with an
existing Supabase user's email just grants teacher access.

**Without the script (SQL Editor):** create the user in **Authentication → Users → Add user**, then run:

```sql
insert into public.profiles (id, role, full_name)
select id, 'teacher', 'Cikgu Aminah' from auth.users where email = 'teacher@school.edu.my'
on conflict (id) do update set role = 'teacher';

insert into public.classes (name, teacher_id)
select '2 Arif', id from auth.users where email = 'teacher@school.edu.my';
```

## 6. Add pupils

**From the teacher dashboard (normal use):** go to **Classes & Accounts → Add pupils**. Type one name per line
(optionally `SQ-2A-001, Name` to choose the Student ID). Each pupil gets a Student ID and a 6-character secret
code. **Print the login cards straight away:** codes are shown only once. Use **New secret code** if a pupil forgets.

**Sample accounts for testing:**

```bash
npm run setup:sample-students -- teacher@school.edu.my "2 Arif"
```

This creates four pupils (`SQ-TEST-001` … `SQ-TEST-004`) and prints their secret codes. They start with no progress.
Running it again issues new codes.

## 7. Run the app

```bash
npm run dev
```

Open http://localhost:3000. Pupils choose **I am a Pupil**, teachers choose **I am a Teacher**.

## How pupil login works

Pupils type their **Student ID** and **secret code**, then confirm **“Are you Aisyah?”**. Behind the scenes each
pupil is a Supabase Auth user (`sq-2a-001@students.sciencequest.app` with the code as password), so sessions,
token refresh and rate limiting all come from Supabase.

## Shared devices (school tablets)

- Pupils should press **Log out** at the end of a lesson. Logging out first tries to send any unsent answers.
- Unsent answers are stored per pupil on the device and are sent the next time that pupil logs in on it.
- Cached pages are cleared on every login and logout, so the next pupil never sees the previous pupil's screens.

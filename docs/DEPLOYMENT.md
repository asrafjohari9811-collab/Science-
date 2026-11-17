# Deployment

The app is a standard Next.js 15 project and deploys to Vercel (recommended), Netlify, or any Node.js host.

## Vercel

1. Push the project to a GitHub repository (the `.gitignore` already excludes `.env.local`).
2. In Vercel: **Add New → Project → Import** the repository. Framework preset: **Next.js**.
3. Under **Environment Variables**, add for *Production* (and *Preview* if you use it):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (**not** prefixed with `NEXT_PUBLIC_`)
   - `NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN` (optional; must match the value used when the pupils were created)
4. Deploy. Then open `https://<your-app>/api/health`. It should return `{"ok":true,"missing":[]}`.
5. In Supabase **Authentication → URL Configuration**, set **Site URL** to your Vercel URL.

Choose the Vercel region closest to your Supabase region (for example `sin1` with Supabase Singapore).

## Any Node.js host

```bash
npm ci
npm run build
npm start        # serves on port 3000 (set PORT to change)
```

Set the same environment variables on the host. Serve over **HTTPS**: browsers only enable the offline service
worker on secure origins.

## Updating

- **Code changes:** redeploy.
- **Content changes:** run `npm run content:sql` and execute `supabase/seed/content.sql` in the Supabase SQL Editor.
  Existing progress is kept.
- **Schema changes:** add a new file in `supabase/migrations/` (never edit an applied one) and run it.

## Backups and data protection

- Supabase backs up the database daily on paid plans. On the free plan, export regularly
  (**Database → Backups**, or the CSV/Excel export in the teacher dashboard).
- Pupil data is limited to name, Student ID, class and learning progress. No email addresses or photos are collected.
- Removing a pupil in **Classes & Accounts** deletes their account and all their progress.

## Production checklist

- [ ] `supabase/setup_all.sql` has been run, and `/api/health` returns `ok: true`
- [ ] Public sign-ups are turned off in Supabase Auth
- [ ] The service-role key is set only as a server environment variable
- [ ] A teacher account exists, and you can log in at `/teacher/login`
- [ ] A test pupil can log in, answer questions, log out, log back in and continue
- [ ] Test pupils are removed (or kept in a separate test class) before real use

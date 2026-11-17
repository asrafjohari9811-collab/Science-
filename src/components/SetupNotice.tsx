import { missingPublicEnv } from '@/lib/env';

/** Shown instead of the app when Supabase has not been configured yet. */
export function SetupNotice() {
  const missing = missingPublicEnv();
  if (!missing.length) return null;
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 text-amber-900">
      <h2 className="text-xl font-bold">Setup needed: the database is not connected yet</h2>
      <p className="mt-2">Add these environment variables (see <code>.env.example</code> and <code>docs/SETUP.md</code>), then restart the app:</p>
      <ul className="mt-3 list-inside list-disc font-mono text-sm">
        {missing.map((m) => <li key={m}>{m}</li>)}
        <li>SUPABASE_SERVICE_ROLE_KEY <span className="font-sans">(server only, for creating pupil accounts)</span></li>
      </ul>
      <p className="mt-3 text-sm">Then run the SQL files in <code>supabase/migrations</code> and <code>supabase/seed/content.sql</code> in your Supabase project.</p>
    </div>
  );
}

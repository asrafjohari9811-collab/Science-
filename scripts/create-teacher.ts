// Creates (or upgrades) a teacher account and a first class.
// Usage: npm run setup:teacher -- teacher@school.edu.my "Cikgu Aminah" "2 Arif"
// A temporary password is printed; the teacher can change it later in Supabase or via "Forgot password" if you enable it.
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';

const [email, fullName, className = '2 Arif'] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !fullName) {
  console.error('Usage: npm run setup:teacher -- <email> "<full name>" ["<class name>"]');
  process.exit(1);
}
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const password = randomBytes(9).toString('base64url');
  let userId: string;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { role: 'teacher' } });
  if (error) {
    if (!/already|exists|registered/i.test(error.message)) throw error;
    // Existing user: look them up and grant teacher role.
    let found: string | undefined;
    for (let page = 1; !found && page < 50; page++) {
      const { data: list, error: lErr } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (lErr) throw lErr;
      found = list.users.find((u: { id: string; email?: string }) => u.email?.toLowerCase() === email.toLowerCase())?.id;
      if (list.users.length < 200) break;
    }
    if (!found) throw new Error('User exists but could not be found.');
    userId = found;
    console.log(`Existing user found. Granting teacher access to ${email}.`);
  } else {
    userId = data.user.id;
    console.log(`Created teacher ${email}\nTemporary password: ${password}\n(Change it after first login.)`);
  }

  const { error: pErr } = await admin.from('profiles').upsert({ id: userId, role: 'teacher', full_name: fullName });
  if (pErr) throw pErr;
  const { error: cErr } = await admin.from('classes').upsert({ name: className, teacher_id: userId }, { onConflict: 'teacher_id,name' });
  if (cErr) throw cErr;
  console.log(`Teacher profile ready with class "${className}".`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

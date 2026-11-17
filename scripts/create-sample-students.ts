// Creates sample pupil accounts for testing in a teacher's class.
// Usage: npm run setup:sample-students -- teacher@school.edu.my ["2 Arif"]
// Prints a table of Student IDs and secret codes. Pupils start with NO progress (no fake data).
import { createClient } from '@supabase/supabase-js';
import { randomInt } from 'node:crypto';

const [teacherEmail, className = '2 Arif'] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const domain = process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN || 'students.sciencequest.app';

const SAMPLE = [
  ['SQ-TEST-001', 'Aisyah Test'],
  ['SQ-TEST-002', 'Kanang Test'],
  ['SQ-TEST-003', 'Mei Ling Test'],
  ['SQ-TEST-004', 'Arjun Test'],
] as const;

if (!teacherEmail) {
  console.error('Usage: npm run setup:sample-students -- <teacher email> ["<class name>"]');
  process.exit(1);
}
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const ALPHABET = '2346789ABCDEFGHJKMNPQRTUVWXYZ';
const code = () => Array.from({ length: 6 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');

async function main() {
  const { data: teacher } = await admin.from('profiles').select('id').eq('role', 'teacher')
    .in('id', (await findUserIds(teacherEmail)) ?? []).maybeSingle();
  if (!teacher) throw new Error(`No teacher profile for ${teacherEmail}. Run npm run setup:teacher first.`);
  const { data: cls, error: cErr } = await admin.from('classes')
    .upsert({ name: className, teacher_id: teacher.id }, { onConflict: 'teacher_id,name' }).select('id').single();
  if (cErr) throw cErr;

  const rows: { 'Student ID': string; Name: string; 'Secret code': string }[] = [];
  for (const [studentCode, fullName] of SAMPLE) {
    const accessCode = code();
    const email = `${studentCode.toLowerCase()}@${domain}`;
    const ids = await findUserIds(email);
    let id = ids?.[0];
    if (id) {
      await admin.auth.admin.updateUserById(id, { password: accessCode });
    } else {
      const { data, error } = await admin.auth.admin.createUser({ email, password: accessCode, email_confirm: true, app_metadata: { role: 'student' } });
      if (error) throw error;
      id = data.user.id;
    }
    await admin.from('profiles').upsert({ id, role: 'student', full_name: fullName });
    const { error: sErr } = await admin.from('students').upsert({ id, student_code: studentCode, full_name: fullName, class_id: cls.id });
    if (sErr) throw sErr;
    rows.push({ 'Student ID': studentCode, Name: fullName, 'Secret code': accessCode });
  }
  console.log(`Sample pupils in class "${className}":`);
  console.table(rows);
}

async function findUserIds(email: string): Promise<string[] | null> {
  for (let page = 1; page < 50; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.filter((u: { id: string; email?: string }) => u.email?.toLowerCase() === email.toLowerCase()).map((u: { id: string; email?: string }) => u.id);
    if (hit.length) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

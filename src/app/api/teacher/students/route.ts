import { NextResponse, type NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { requireTeacher, serverError } from '@/lib/api-auth';
import { STUDENT_CODE_PATTERN, generateAccessCode, normalizeStudentCode, studentEmail } from '@/lib/student-account';

export const runtime = 'nodejs';

interface NewStudent { fullName?: unknown; studentCode?: unknown }

function autoCode(): string {
  const digits = '23456789';
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return 'SQ-' + Array.from(bytes, (b) => digits[b % digits.length]).join('');
}

/** Create pupil accounts in one of the teacher's classes. Returns each pupil's secret code once. */
export async function POST(req: NextRequest) {
  const auth = await requireTeacher();
  if ('error' in auth) return auth.error;

  let body: { classId?: unknown; students?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const classId = typeof body.classId === 'string' ? body.classId : '';
  const list = Array.isArray(body.students) ? (body.students as NewStudent[]) : [];
  if (!classId || list.length === 0 || list.length > 60) {
    return NextResponse.json({ error: 'Choose a class and add between 1 and 60 pupils.' }, { status: 400 });
  }

  // Row level security only returns the class if this teacher owns it.
  const { data: cls } = await auth.supabase.from('classes').select('id').eq('id', classId).maybeSingle();
  if (!cls) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  let admin;
  try {
    admin = getAdminClient();
  } catch (e) {
    return serverError(e);
  }

  const results: { fullName: string; studentCode?: string; accessCode?: string; error?: string }[] = [];
  for (const item of list) {
    const fullName = typeof item.fullName === 'string' ? item.fullName.trim().replace(/\s+/g, ' ') : '';
    if (!fullName || fullName.length > 120) {
      results.push({ fullName: fullName || '(blank)', error: 'Name is required (max 120 characters).' });
      continue;
    }
    let code = typeof item.studentCode === 'string' && item.studentCode.trim() ? normalizeStudentCode(item.studentCode) : autoCode();
    if (!STUDENT_CODE_PATTERN.test(code)) {
      results.push({ fullName, error: 'Student ID must be 3–20 letters, numbers or dashes.' });
      continue;
    }
    // Auto codes: retry a few times on the rare clash.
    for (let i = 0; i < 4 && !item.studentCode; i++) {
      const { data: taken } = await admin.from('students').select('id').eq('student_code', code).maybeSingle();
      if (!taken) break;
      code = autoCode();
    }
    const accessCode = generateAccessCode();
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: studentEmail(code),
      password: accessCode,
      email_confirm: true,
      app_metadata: { role: 'student' },
      user_metadata: { full_name: fullName },
    });
    if (createErr || !created.user) {
      results.push({ fullName, studentCode: code, error: /already|exists|registered/i.test(createErr?.message ?? '') ? 'That Student ID is already used.' : (createErr?.message ?? 'Could not create account') });
      continue;
    }
    const uid = created.user.id;
    const { error: pErr } = await admin.from('profiles').insert({ id: uid, role: 'student', full_name: fullName });
    const { error: sErr } = pErr ? { error: pErr } : await admin.from('students').insert({ id: uid, student_code: code, full_name: fullName, class_id: classId });
    if (pErr || sErr) {
      await admin.auth.admin.deleteUser(uid); // roll back
      results.push({ fullName, studentCode: code, error: (pErr ?? sErr)!.message });
      continue;
    }
    results.push({ fullName, studentCode: code, accessCode });
  }
  return NextResponse.json({ results });
}

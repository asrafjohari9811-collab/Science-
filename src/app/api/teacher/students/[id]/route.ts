import { NextResponse, type NextRequest } from 'next/server';
import { getAdminClient } from '@/lib/supabase/server';
import { requireTeacher, serverError } from '@/lib/api-auth';
import { generateAccessCode } from '@/lib/student-account';

export const runtime = 'nodejs';

type Ctx = { params: Promise<{ id: string }> };

async function ownedStudent(id: string) {
  const auth = await requireTeacher();
  if ('error' in auth) return { error: auth.error } as const;
  // Row level security: only returns the pupil if they are in one of this teacher's classes.
  const { data } = await auth.supabase.from('students').select('id, full_name, student_code').eq('id', id).maybeSingle();
  if (!data) return { error: NextResponse.json({ error: 'Pupil not found' }, { status: 404 }) } as const;
  return { ...auth, student: data } as const;
}

/** POST = give the pupil a new secret code. */
export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await ownedStudent(id);
  if ('error' in res) return res.error;
  try {
    const accessCode = generateAccessCode();
    const { error } = await getAdminClient().auth.admin.updateUserById(id, { password: accessCode });
    if (error) throw new Error(error.message);
    return NextResponse.json({ studentCode: res.student.student_code, fullName: res.student.full_name, accessCode });
  } catch (e) {
    return serverError(e);
  }
}

/** DELETE = remove the pupil account and all of their progress. */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const res = await ownedStudent(id);
  if ('error' in res) return res.error;
  try {
    const { error } = await getAdminClient().auth.admin.deleteUser(id);
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return serverError(e);
  }
}

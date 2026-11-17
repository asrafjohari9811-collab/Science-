import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';
import { StudentProvider, type StudentInfo } from '@/components/student/StudentProvider';
import { StudentHeader } from '@/components/student/StudentHeader';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) redirect('/login');
  if (profile?.role === 'teacher') redirect('/teacher');

  const { data: s } = await supabase
    .from('students')
    .select('id, full_name, student_code, classes(name)')
    .eq('id', user.id)
    .maybeSingle();
  if (!s) redirect('/login');

  const cls = (s as { classes?: { name: string } | { name: string }[] | null }).classes;
  const student: StudentInfo = {
    id: s.id,
    fullName: s.full_name,
    studentCode: s.student_code,
    className: Array.isArray(cls) ? (cls[0]?.name ?? null) : (cls?.name ?? null),
  };

  return (
    <StudentProvider student={student}>
      <StudentHeader />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
    </StudentProvider>
  );
}

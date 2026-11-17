import { redirect } from 'next/navigation';
import { getSessionProfile } from '@/lib/supabase/server';
import { TeacherNav } from '@/components/teacher/TeacherNav';

export const dynamic = 'force-dynamic';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect('/teacher/login');
  if (profile?.role !== 'teacher') redirect(profile?.role === 'student' ? '/dashboard' : '/teacher/login');

  return (
    <div className="min-h-screen bg-slate-50">
      <TeacherNav name={profile.full_name} />
      <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
    </div>
  );
}

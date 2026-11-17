import { getServerClient } from '@/lib/supabase/server';
import { ClassManager } from '@/components/teacher/ClassManager';

export const metadata = { title: 'Classes & accounts' };

export default async function ClassesPage() {
  const supabase = await getServerClient();
  const [{ data: classes }, { data: students }] = await Promise.all([
    supabase.from('classes').select('id, name, created_at').order('name'),
    supabase.from('students').select('id, student_code, full_name, class_id').order('full_name'),
  ]);
  const serviceKeyMissing = !process.env.SUPABASE_SERVICE_ROLE_KEY;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Classes & accounts</h1>
        <p className="text-slate-500">Create classes, add pupils and print their login cards.</p>
      </div>
      {serviceKeyMissing && (
        <p className="rounded-2xl bg-amber-50 p-4 text-amber-900">
          <strong>Setup needed:</strong> add <code>SUPABASE_SERVICE_ROLE_KEY</code> to the server environment to create pupil accounts or reset codes.
        </p>
      )}
      <ClassManager classes={classes ?? []} students={students ?? []} />
    </div>
  );
}

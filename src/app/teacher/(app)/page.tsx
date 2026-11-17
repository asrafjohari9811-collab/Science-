import Link from 'next/link';
import { getServerClient } from '@/lib/supabase/server';
import { loadTeacherData } from '@/lib/teacher-data';
import { classOverview, summarise, unitStats } from '@/lib/report';
import { relativeTime } from '@/lib/progress';
import { ClassCharts } from '@/components/teacher/ClassCharts';
import { ClassPicker } from '@/components/teacher/ClassPicker';
import { Card, EmptyState, ProgressBar, btn } from '@/components/ui';

export const metadata = { title: 'Teacher overview' };

export default async function TeacherOverview({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const { class: classParam } = await searchParams;
  const supabase = await getServerClient();
  const data = await loadTeacherData(supabase, classParam);
  const summaries = summarise(data.students, data.progress, data.scores);
  const ov = classOverview(summaries, data.progress);
  const units = unitStats(data.students.length, data.progress);
  const recent = [...summaries].filter((s) => s.lastActive).sort((a, b) => (b.lastActive ?? '').localeCompare(a.lastActive ?? '')).slice(0, 6);

  if (!data.classes.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Welcome!</h1>
        <EmptyState title="Create your first class to get started">
          <Link href="/teacher/classes" className={`${btn.smallPrimary} mt-3`}>Go to Classes & Accounts</Link>
        </EmptyState>
      </div>
    );
  }

  const tiles = [
    { label: 'Registered students', value: ov.totalStudents },
    { label: 'Activities completed', value: ov.completedActivities },
    { label: 'Activities in progress', value: ov.inProgressActivities },
    { label: 'Students not started', value: ov.notStartedStudents },
    { label: 'Average class score', value: ov.averageScore === null ? '—' : `${ov.averageScore}%` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Class overview</h1>
          <p className="text-slate-500">Live progress from your pupils’ saved work.</p>
        </div>
        <ClassPicker classes={data.classes} selected={data.selectedClassId} />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="sm:col-span-2 lg:col-span-1 lg:row-span-1">
          <p className="text-sm font-medium text-slate-500">Class completion</p>
          <p className="mt-1 text-4xl font-bold text-slate-900">{ov.completionPct}%</p>
          <div className="mt-3"><ProgressBar value={ov.completionPct} size="sm" label="Class completion" /></div>
        </Card>
        {tiles.map((t) => (
          <Card key={t.label}>
            <p className="text-sm font-medium text-slate-500">{t.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{t.value}</p>
          </Card>
        ))}
      </section>

      <ClassCharts units={units} students={summaries.map((s) => ({ name: s.student.full_name, overall: s.overall }))} />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Recently active</h2>
          <Link href="/teacher/students" className={btn.small}>All student records →</Link>
        </div>
        <Card className="p-0">
          {recent.length ? (
            <ul className="divide-y divide-slate-100">
              {recent.map((s) => (
                <li key={s.student.id}>
                  <Link href={`/teacher/students/${s.student.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50">
                    <span className="flex-1 font-medium text-slate-800">{s.student.full_name}</span>
                    <span className="hidden w-48 sm:block"><ProgressBar value={s.overall} size="sm" label={`${s.student.full_name} progress`} /></span>
                    <span className="w-12 text-right text-sm font-semibold">{s.overall}%</span>
                    <span className="w-28 text-right text-sm text-slate-500">{relativeTime(s.lastActive)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-slate-500">No pupil activity yet.</p>
          )}
        </Card>
      </section>
    </div>
  );
}

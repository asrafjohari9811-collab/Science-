import { getServerClient } from '@/lib/supabase/server';
import { loadTeacherData } from '@/lib/teacher-data';
import { detailRows, summarise, summaryRows } from '@/lib/report';
import { StudentTable } from '@/components/teacher/StudentTable';
import { ClassPicker } from '@/components/teacher/ClassPicker';

export const metadata = { title: 'Student records' };

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const { class: classParam } = await searchParams;
  const supabase = await getServerClient();
  const data = await loadTeacherData(supabase, classParam);
  const summaries = summarise(data.students, data.progress, data.scores);
  const className = data.selectedClassId ? data.classes.find((c) => c.id === data.selectedClassId)?.name : 'All classes';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Student records</h1>
          <p className="text-slate-500">{className} · {summaries.length} pupils</p>
        </div>
        <ClassPicker classes={data.classes} selected={data.selectedClassId} />
      </div>
      <StudentTable
        summaries={summaries}
        progress={data.progress}
        students={data.students}
        exportSummary={summaryRows(summaries)}
        exportDetail={detailRows(data.students, data.progress)}
        title={`Science Quest Year 2 — Class progress report (${className})`}
      />
    </div>
  );
}

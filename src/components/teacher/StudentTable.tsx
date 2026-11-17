'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ACTIVITIES, LEVEL_LABEL, UNITS } from '@/lib/content';
import { formatDateTime, relativeTime, type ProgressRow, type Status } from '@/lib/progress';
import { notAttempted, toCsv, type StudentRecord, type StudentSummary } from '@/lib/report';
import { Card, EmptyState, ProgressBar, btn } from '@/components/ui';

type SortKey = 'name' | 'id' | 'overall' | 'avg' | 'last';

const DOT: Record<Status, string> = { completed: 'bg-leaf-500', in_progress: 'bg-brand-500', not_started: 'bg-slate-300' };
const SHORT: Record<Status, string> = { completed: 'Done', in_progress: 'In progress', not_started: 'Not started' };

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function StudentTable({
  summaries, progress, students, exportSummary, exportDetail, title,
}: {
  summaries: StudentSummary[];
  progress: ProgressRow[];
  students: StudentRecord[];
  exportSummary: Record<string, string | number>[];
  exportDetail: Record<string, string | number>[];
  title: string;
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; asc: boolean }>({ key: 'name', asc: true });
  const [activity, setActivity] = useState('');
  const [exporting, setExporting] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = summaries.filter((s) => !q || s.student.full_name.toLowerCase().includes(q) || s.student.student_code.toLowerCase().includes(q));
    const dir = sort.asc ? 1 : -1;
    const val = (s: StudentSummary): string | number => {
      switch (sort.key) {
        case 'name': return s.student.full_name.toLowerCase();
        case 'id': return s.student.student_code;
        case 'overall': return s.overall;
        case 'avg': return s.avgScore ?? -1;
        case 'last': return s.lastActive ?? '';
      }
    };
    return [...list].sort((a, b) => (val(a) < val(b) ? -dir : val(a) > val(b) ? dir : 0));
  }, [summaries, query, sort]);

  const missing = useMemo(() => (activity ? notAttempted(students, progress, activity) : []), [activity, students, progress]);

  const header = (key: SortKey, label: string, cls = '') => (
    <th className={`px-3 py-3 ${cls}`} aria-sort={sort.key === key ? (sort.asc ? 'ascending' : 'descending') : 'none'}>
      <button type="button" className="inline-flex items-center gap-1 font-semibold hover:text-brand-700"
        onClick={() => setSort((s) => ({ key, asc: s.key === key ? !s.asc : key === 'name' || key === 'id' }))}>
        {label}
        <span className="text-xs text-slate-400" aria-hidden>{sort.key === key ? (sort.asc ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );

  const stamp = new Date().toISOString().slice(0, 10);
  const exportCsv = () => download(`science-quest-progress-${stamp}.csv`, new Blob(['﻿' + toCsv(exportDetail)], { type: 'text/csv;charset=utf-8' }));
  const exportExcel = async () => {
    setExporting(true);
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportSummary), 'Summary');
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportDetail), 'Activity details');
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      download(`science-quest-progress-${stamp}.xlsx`, new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    } finally {
      setExporting(false);
    }
  };

  if (!summaries.length) {
    return (
      <EmptyState title="No pupils in this class yet">
        <Link href="/teacher/classes" className={`${btn.smallPrimary} mt-3`}>Add pupils</Link>
      </EmptyState>
    );
  }

  return (
    <div className="space-y-5">
      <div className="print-only mb-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm">Printed {formatDateTime(new Date().toISOString())}</p>
      </div>

      <div className="no-print flex flex-wrap items-center gap-3">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or ID…" aria-label="Search students"
          className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        <div className="ml-auto flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} className={btn.small}>Export CSV</button>
          <button type="button" onClick={exportExcel} disabled={exporting} className={btn.small}>{exporting ? 'Preparing…' : 'Export Excel'}</button>
          <button type="button" onClick={() => window.print()} className={btn.small}>Print class report</button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                {header('id', 'Student ID')}
                {header('name', 'Student Name')}
                {UNITS.map((u) => <th key={u.id} className="px-1 py-3 text-center font-semibold" title={u.title}>U{u.id}</th>)}
                {header('overall', 'Overall Progress')}
                {header('avg', 'Average Score')}
                {header('last', 'Last Active')}
                <th className="no-print px-3 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((s) => (
                <tr key={s.student.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-3 font-mono text-xs text-slate-600">{s.student.student_code}</td>
                  <td className="px-3 py-3">
                    <Link href={`/teacher/students/${s.student.id}`} className="font-semibold text-slate-800 hover:text-brand-700 hover:underline">{s.student.full_name}</Link>
                    {s.student.class_name && <span className="block text-xs text-slate-500">{s.student.class_name}</span>}
                  </td>
                  {s.units.map((u) => (
                    <td key={u.unitId} className="px-1 py-3 text-center" title={`Unit ${u.unitId}: ${SHORT[u.status]} (${u.pct}%)`}>
                      <span className={`mx-auto block h-3.5 w-3.5 rounded-full ${DOT[u.status]}`} aria-label={`Unit ${u.unitId} ${SHORT[u.status]}`} />
                      <span className="mt-0.5 block text-[10px] text-slate-400">{u.pct}%</span>
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24"><ProgressBar value={s.overall} size="sm" label={`${s.student.full_name} overall`} /></div>
                      <span className="font-semibold">{s.overall}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold">{s.avgScore === null ? '—' : `${s.avgScore}%`}</td>
                  <td className="px-3 py-3 text-slate-600" title={formatDateTime(s.lastActive)}>{relativeTime(s.lastActive)}</td>
                  <td className="no-print px-3 py-3"><Link href={`/teacher/students/${s.student.id}`} className={btn.small}>View report</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-4 border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-leaf-500" /> Completed</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> In Progress</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Not Started</span>
        </div>
      </Card>

      <Card className="no-print">
        <h2 className="text-lg font-semibold text-slate-900">Who has not attempted an activity?</h2>
        <select value={activity} onChange={(e) => setActivity(e.target.value)} aria-label="Choose an activity"
          className="mt-3 w-full max-w-xl rounded-xl border border-slate-200 bg-white px-3 py-2.5">
          <option value="">Choose an activity…</option>
          {UNITS.map((u) => (
            <optgroup key={u.id} label={`Unit ${u.id}: ${u.title}`}>
              {ACTIVITIES.filter((a) => a.unitId === u.id).map((a) => <option key={a.id} value={a.id}>{LEVEL_LABEL[a.level]} — {a.title}</option>)}
            </optgroup>
          ))}
        </select>
        {activity && (
          missing.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {missing.map((s) => (
                <li key={s.id}><Link href={`/teacher/students/${s.id}`} className="inline-block rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-900 hover:bg-amber-100">{s.full_name}</Link></li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-leaf-700">Every pupil has attempted this activity. 🎉</p>
          )
        )}
      </Card>
    </div>
  );
}

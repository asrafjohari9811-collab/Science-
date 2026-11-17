import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchAll, getServerClient } from '@/lib/supabase/server';
import { ACTIVITIES, LEVEL_LABEL, UNITS, getActivity } from '@/lib/content';
import { describeResponse } from '@/lib/grading';
import {
  STATUS_LABEL, averageScore, earnedBadges, formatDateTime, indexProgress, lastActive, num, overallPct, totalStars, unitSummary,
  type ProgressRow, type ScoreRow,
} from '@/lib/progress';
import { lastSavedPosition } from '@/lib/report';
import type { Response } from '@/lib/content/types';
import { Card, ProgressBar, StatusPill } from '@/components/ui';
import { PrintButton } from '@/components/teacher/PrintButton';

export const metadata = { title: 'Student report' };

interface AttemptRow { id: string; activity_id: string; attempt_no: number; status: string; correct_count: number; incorrect_count: number; current_index: number; total_questions: number; started_at: string; updated_at: string; completed_at: string | null }
interface AnswerRow { attempt_id: string; question_index: number; response: Response; is_correct: boolean; answered_at: string }

export default async function StudentReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getServerClient();
  // Row level security returns nothing unless this pupil is in one of the teacher's classes.
  const { data: student } = await supabase.from('students').select('id, student_code, full_name, created_at, classes(name)').eq('id', id).maybeSingle();
  if (!student) notFound();

  const [{ data: p }, { data: s }, a, ans] = await Promise.all([
    supabase.from('student_progress').select('*').eq('student_id', id),
    supabase.from('scores').select('*').eq('student_id', id).order('completed_at', { ascending: false }),
    fetchAll<AttemptRow>((from, to) => supabase.from('activity_attempts').select('*').eq('student_id', id).order('updated_at', { ascending: false }).range(from, to)),
    fetchAll<AnswerRow>((from, to) =>
      supabase.from('attempt_answers').select('attempt_id, question_index, response, is_correct, answered_at').eq('student_id', id).order('id').range(from, to)),
  ]);
  const progress = (p ?? []) as ProgressRow[];
  const scores = (s ?? []) as ScoreRow[];
  const attempts = a;
  const answers = [...ans].sort((x, y) => x.question_index - y.question_index);
  const by = indexProgress(progress);
  const cls = (student as { classes?: { name: string } | { name: string }[] | null }).classes;
  const className = Array.isArray(cls) ? cls[0]?.name : cls?.name;
  const avg = averageScore(progress);
  const badges = earnedBadges(progress, scores);
  const totalCorrect = progress.reduce((n, r) => n + r.correct_answers, 0);
  const totalIncorrect = progress.reduce((n, r) => n + r.incorrect_answers, 0);
  const answersBy = new Map<string, AnswerRow[]>();
  for (const x of answers) answersBy.set(x.attempt_id, [...(answersBy.get(x.attempt_id) ?? []), x]);

  return (
    <div className="space-y-6">
      <div className="no-print flex items-center justify-between">
        <Link href="/teacher/students" className="font-medium text-slate-500 hover:text-brand-700">← Student records</Link>
        <PrintButton label="Print report" />
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Science Quest Year 2 · Individual student report</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">{student.full_name}</h1>
            <p className="mt-1 text-slate-600">Student ID <span className="font-mono">{student.student_code}</span>{className && <> · Class {className}</>}</p>
            <p className="mt-3 text-slate-700"><span className="font-semibold">Last saved position:</span> {lastSavedPosition(progress)}</p>
            <p className="text-slate-700"><span className="font-semibold">Last active:</span> {formatDateTime(lastActive(progress))}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
            <Mini label="Overall progress" value={`${overallPct(by)}%`} />
            <Mini label="Average score" value={avg === null ? '—' : `${avg}%`} />
            <Mini label="Correct / incorrect" value={`${totalCorrect} / ${totalIncorrect}`} hint="latest attempts" />
            <Mini label="Stars" value={String(totalStars(scores))} />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-slate-900">Unit-by-unit progress</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Unit / activity</th><th>Status</th><th>Questions done</th><th>Correct</th><th>Incorrect</th>
                <th>Score</th><th>Best</th><th>Attempts</th><th>Last saved question</th><th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {UNITS.map((u) => {
                const us = unitSummary(u, by);
                return [
                  <tr key={`u${u.id}`} className="border-t-2 border-slate-100 bg-slate-50/70">
                    <td className="py-2 font-semibold text-slate-800" colSpan={2}>Unit {u.id}: {u.title}</td>
                    <td colSpan={8} className="py-2">
                      <div className="flex items-center gap-3"><div className="w-40"><ProgressBar value={us.pct} status={us.status} size="sm" /></div><span>{us.pct}%</span><StatusPill status={us.status} small /></div>
                    </td>
                  </tr>,
                  ...u.activities.map((act) => {
                    const r = by.get(act.id);
                    return (
                      <tr key={act.id} className="border-t border-slate-100 text-slate-700">
                        <td className="py-2 pl-4">{LEVEL_LABEL[act.level]} — {act.title}</td>
                        <td>{STATUS_LABEL[r?.status ?? 'not_started']}</td>
                        <td>{r?.questions_completed ?? 0}/{act.questions.length}</td>
                        <td>{r?.correct_answers ?? 0}</td>
                        <td>{r?.incorrect_answers ?? 0}</td>
                        <td>{r ? r.total_score : '—'}</td>
                        <td>{r?.status === 'completed' ? `${r.best_score} (${Math.round(num(r.best_percentage))}%)` : '—'}</td>
                        <td>{r?.total_attempts ?? 0}</td>
                        <td>{r?.last_question_index != null ? `Q${r.last_question_index + 1}` : '—'}</td>
                        <td>{formatDateTime(r?.last_activity_at)}</td>
                      </tr>
                    );
                  }),
                ];
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="print-break">
        <h2 className="text-xl font-bold text-slate-900">Activity history</h2>
        {attempts.length === 0 ? (
          <p className="mt-3 text-slate-500">No activities attempted yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {attempts.map((at) => {
              const act = getActivity(at.activity_id);
              const list = answersBy.get(at.id) ?? [];
              return (
                <details key={at.id} className="rounded-2xl border border-slate-100 p-4 open:bg-slate-50/50">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold text-slate-800">Unit {act?.unitId} · {act?.title ?? at.activity_id}</span>
                    <span className="text-sm text-slate-500">Attempt {at.attempt_no}</span>
                    <span className="text-sm">{at.status === 'completed' ? '✅ Completed' : at.status === 'abandoned' ? '↺ Restarted' : '⏳ In progress'}</span>
                    <span className="text-sm font-semibold">{at.correct_count}/{at.total_questions} correct · {at.current_index} answered</span>
                    <span className="ml-auto text-sm text-slate-500">{formatDateTime(at.completed_at ?? at.updated_at)}</span>
                  </summary>
                  {act && list.length > 0 && (
                    <ol className="mt-3 space-y-1.5 text-sm">
                      {list.map((x) => (
                        <li key={x.question_index} className="flex gap-2">
                          <span aria-label={x.is_correct ? 'correct' : 'incorrect'}>{x.is_correct ? '✅' : '❌'}</span>
                          <span><span className="font-medium">Q{x.question_index + 1}. {act.questions[x.question_index]?.prompt.split('\n')[0]}</span>
                            <span className="text-slate-500"> — answered: {describeResponse(act.questions[x.question_index], x.response)}</span></span>
                        </li>
                      ))}
                    </ol>
                  )}
                </details>
              );
            })}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-slate-900">Learning achievements</h2>
        {badges.length ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {badges.map((b) => <li key={b.id} className="rounded-full bg-slate-50 px-3 py-1.5 text-sm"><span aria-hidden>{b.emoji}</span> {b.title}</li>)}
          </ul>
        ) : <p className="mt-3 text-slate-500">No badges yet.</p>}
        <p className="mt-4 text-sm text-slate-500">
          Activities completed: {progress.filter((r) => r.status === 'completed').length} of {ACTIVITIES.length}
        </p>
      </Card>
    </div>
  );
}

function Mini({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

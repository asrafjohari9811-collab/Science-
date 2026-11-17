'use client';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useMemo } from 'react';
import { LEVEL_LABEL, getUnit } from '@/lib/content';
import { indexProgress, num, starsFor, unitSummary } from '@/lib/progress';
import { useStudent } from '@/components/student/StudentProvider';
import { SpeakButton } from '@/components/SpeakButton';
import { UnitIcon, UNIT_TINT } from '@/components/UnitIcon';
import { Card, ProgressBar, Spinner, Stars, StatusPill, btn } from '@/components/ui';

const LEVEL_STYLE: Record<number, string> = {
  1: 'bg-sky-50 text-sky-700',
  2: 'bg-violet-50 text-violet-700',
  3: 'bg-amber-50 text-amber-800',
  4: 'bg-leaf-50 text-leaf-700',
};

export default function UnitPage() {
  const params = useParams<{ unitId: string }>();
  const unit = getUnit(Number(params.unitId));
  const { progress, progressLoaded } = useStudent();
  const by = useMemo(() => indexProgress(progress), [progress]);
  if (!unit) notFound();
  if (!progressLoaded) return <Spinner />;
  const summary = unitSummary(unit, by);

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-700"><span aria-hidden>←</span> My dashboard</Link>

      <section className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <span className={`grid h-20 w-20 shrink-0 place-items-center rounded-3xl ${UNIT_TINT[unit.id]}`}><UnitIcon unitId={unit.id} className="h-12 w-12" /></span>
        <div className="flex-1">
          <p className="font-semibold text-brand-600">Unit {unit.id} · {unit.theme}</p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{unit.title}</h1>
          <p className="mt-2 max-w-2xl text-lg text-slate-600">{unit.intro}</p>
        </div>
        <div className="w-full sm:w-56">
          <div className="mb-1 flex justify-between text-sm text-slate-500"><StatusPill status={summary.status} small /><span className="font-semibold">{summary.pct}%</span></div>
          <ProgressBar value={summary.pct} status={summary.status} />
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900">What I will learn</h2>
            <SpeakButton text={unit.objectives.join('. ')} />
          </div>
          <ul className="mt-4 space-y-3">
            {unit.objectives.map((o) => (
              <li key={o} className="flex gap-3 text-lg text-slate-700">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-leaf-100 text-sm text-leaf-700" aria-hidden>✓</span>
                {o}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xl font-bold text-slate-900">Learning notes</h2>
            <SpeakButton text={unit.notes.map((n) => `${n.heading}. ${n.body}`).join(' ')} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {unit.notes.map((n) => (
              <div key={n.heading} className="rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-2 font-semibold text-slate-800"><span className="text-2xl" aria-hidden>{n.emoji}</span>{n.heading}</p>
                <p className="mt-1 text-slate-600">{n.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section aria-labelledby="acts">
        <h2 id="acts" className="mb-3 text-xl font-bold text-slate-900">Activities</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {unit.activities.map((a) => {
            const row = by.get(a.id);
            const status = row?.status ?? 'not_started';
            const open = row && row.questions_completed > 0 && row.questions_completed < a.questions.length && row.current_attempt_id;
            const done = status === 'completed';
            return (
              <Card key={a.id} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${LEVEL_STYLE[a.level]}`}>{LEVEL_LABEL[a.level]}</span>
                  <StatusPill status={status} small />
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{a.title}</h3>
                <p className="text-slate-500">{a.skill} · {a.questions.length} questions</p>
                {open && <p className="mt-2 text-brand-700">Continue from question {row!.questions_completed + 1}</p>}
                {done && row && (
                  <p className="mt-2 flex items-center gap-2 text-slate-600">
                    Best score: <strong>{row.best_score}/{a.questions.length}</strong>
                    <Stars count={starsFor(row.best_score, a.questions.length)} size="sm" />
                  </p>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  {open ? (
                    <>
                      <Link href={`/learn/${a.id}`} className={btn.primary}>Continue</Link>
                      <Link href={`/learn/${a.id}?restart=1`} className={btn.secondary}>Start again</Link>
                    </>
                  ) : done ? (
                    <>
                      <Link href={`/learn/${a.id}/review`} className={btn.secondary}>Review</Link>
                      <Link href={`/learn/${a.id}?restart=1`} className={btn.primary}>Try again</Link>
                    </>
                  ) : (
                    <Link href={`/learn/${a.id}`} className={btn.primary}>Start</Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="summary">
        <h2 id="summary" className="mb-3 text-xl font-bold text-slate-900">Score summary</h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead className="text-sm text-slate-500">
                <tr><th className="pb-2">Activity</th><th className="pb-2">Status</th><th className="pb-2">Best score</th><th className="pb-2">Tries</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unit.activities.map((a) => {
                  const r = by.get(a.id);
                  return (
                    <tr key={a.id}>
                      <td className="py-3 font-medium text-slate-800">{a.title}</td>
                      <td className="py-3"><StatusPill status={r?.status ?? 'not_started'} small /></td>
                      <td className="py-3">{r?.status === 'completed' ? `${r.best_score}/${a.questions.length} (${Math.round(num(r.best_percentage))}%)` : '—'}</td>
                      <td className="py-3">{r?.total_attempts ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {summary.avgScore !== null && <p className="mt-4 text-slate-600">Average score in this unit: <strong>{summary.avgScore}%</strong></p>}
        </Card>
      </section>
    </div>
  );
}

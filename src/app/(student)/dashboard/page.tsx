'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LEVEL_LABEL, UNITS, getActivity, getUnit } from '@/lib/content';
import {
  earnedBadges, indexProgress, latestUnfinished, nextSuggested, overallPct, totalStars, unitSummary,
} from '@/lib/progress';
import { useStudent } from '@/components/student/StudentProvider';
import { UnitIcon, UNIT_TINT } from '@/components/UnitIcon';
import { Card, ProgressBar, Spinner, StatusPill, btn } from '@/components/ui';

export default function Dashboard() {
  const { student, progress, scores, progressLoaded, fromCache, pending } = useStudent();
  const [welcome, setWelcome] = useState(false);

  const by = useMemo(() => indexProgress(progress), [progress]);
  const resume = useMemo(() => latestUnfinished(progress), [progress]);
  const suggestion = useMemo(() => nextSuggested(by), [by]);
  const badges = useMemo(() => earnedBadges(progress, scores), [progress, scores]);
  const overall = overallPct(by);
  const unitStats = UNITS.map((u) => ({ unit: u, ...unitSummary(u, by) }));
  const unfinished = progress.filter((r) => r.status === 'in_progress' && r.current_attempt_id && r.questions_completed > 0);

  // "Welcome back!" once per login, only if there is something to continue.
  useEffect(() => {
    if (!progressLoaded || !resume) return;
    try {
      if (!sessionStorage.getItem('sq:welcomed')) setWelcome(true);
      sessionStorage.setItem('sq:welcomed', '1');
    } catch {
      setWelcome(true);
    }
  }, [progressLoaded, resume]);

  if (!progressLoaded) return <Spinner label="Loading your progress…" />;

  const resumeAct = resume ? getActivity(resume.activity_id) : null;
  const firstName = student.fullName.split(' ')[0];

  return (
    <div className="space-y-8">
      {welcome && resume && resumeAct && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" aria-labelledby="wb-title">
          <div className="w-full max-w-md animate-pop rounded-3xl bg-white p-8 text-center shadow-xl">
            <p className="text-6xl" aria-hidden>🚀</p>
            <h2 id="wb-title" className="mt-4 text-2xl font-bold text-slate-900">Welcome back! Would you like to continue where you left off?</h2>
            <p className="mt-3 text-slate-600">
              Unit {resumeAct.unitId}: {resumeAct.title} — question {resume.questions_completed + 1} of {resumeAct.questions.length}
            </p>
            <div className="mt-7 grid gap-3">
              <Link href={`/learn/${resumeAct.id}`} className={btn.primary}>Continue Learning</Link>
              <button type="button" onClick={() => setWelcome(false)} className={btn.secondary}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-lg text-slate-500">Hello,</p>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">{firstName}! 👋</h1>
          <p className="mt-1 text-lg text-slate-600">Ready to explore some science today?</p>
          <div className="mt-6">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-semibold text-slate-700">My learning progress</span>
              <span className="text-2xl font-bold text-brand-700">{overall}%</span>
            </div>
            <ProgressBar value={overall} size="lg" label="Overall progress" />
          </div>
          {(fromCache || pending > 0) && (
            <p className="mt-4 rounded-xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
              {pending > 0 ? `${pending} answer${pending > 1 ? 's are' : ' is'} saved on this device and will sync when you are online.` : 'Showing progress saved on this device.'}
            </p>
          )}
        </Card>
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
          <Stat emoji="⭐" value={totalStars(scores)} label="Stars earned" />
          <Stat emoji="🏁" value={unitStats.filter((u) => u.status === 'completed').length} label="Units completed" />
          <Stat emoji="📝" value={unfinished.length} label="Unfinished activities" />
        </div>
      </section>

      {(resumeAct || suggestion) && (
        <section aria-labelledby="continue">
          <h2 id="continue" className="mb-3 text-xl font-bold text-slate-900">Continue Learning</h2>
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {(() => {
              const act = resumeAct ?? suggestion!;
              const unit = getUnit(act.unitId)!;
              return (
                <>
                  <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${UNIT_TINT[unit.id]}`}><UnitIcon unitId={unit.id} className="h-10 w-10" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500">Unit {unit.id} · {LEVEL_LABEL[act.level]}</p>
                    <p className="text-xl font-semibold text-slate-900">{act.title}</p>
                    {resume && resumeAct && (
                      <p className="text-slate-600">You stopped at question {resume.questions_completed + 1} of {resumeAct.questions.length}.</p>
                    )}
                  </div>
                  <Link href={`/learn/${act.id}`} className={btn.primary}>{resumeAct ? 'Continue' : 'Start'} <span aria-hidden>→</span></Link>
                </>
              );
            })()}
          </Card>
        </section>
      )}

      <section aria-labelledby="units">
        <h2 id="units" className="mb-3 text-xl font-bold text-slate-900">My Science Units</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {unitStats.map(({ unit, pct, status }) => (
            <Link key={unit.id} href={`/units/${unit.id}`}
              className={`group flex flex-col rounded-3xl border-2 bg-white p-5 shadow-card transition hover:-translate-y-0.5 ${
                status === 'completed' ? 'border-leaf-500/40' : status === 'in_progress' ? 'border-brand-300' : 'border-slate-100'
              }`}>
              <div className="flex items-start justify-between">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl ${UNIT_TINT[unit.id]}`}><UnitIcon unitId={unit.id} className="h-9 w-9" /></span>
                <span className="text-sm font-semibold text-slate-400">Unit {unit.id}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{unit.title}</h3>
              <div className="mt-2"><StatusPill status={status} small /></div>
              <div className="mt-auto pt-4">
                <div className="mb-1 flex justify-between text-sm text-slate-500"><span>Progress</span><span className="font-semibold">{pct}%</span></div>
                <ProgressBar value={pct} status={status} size="sm" label={`Unit ${unit.id} progress`} />
                <span className={`mt-4 block rounded-xl py-2 text-center font-semibold ${status === 'not_started' ? 'bg-brand-600 text-white' : status === 'in_progress' ? 'bg-brand-50 text-brand-700' : 'bg-leaf-50 text-leaf-700'}`}>
                  {status === 'not_started' ? 'Start' : status === 'in_progress' ? 'Continue' : 'Review'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="badges">
        <h2 id="badges" className="mb-3 text-xl font-bold text-slate-900">Recent Achievements</h2>
        {badges.length ? (
          <div className="flex flex-wrap gap-3">
            {badges.slice(-6).reverse().map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-card">
                <span className="text-3xl" aria-hidden>{b.emoji}</span>
                <span>
                  <span className="block font-semibold text-slate-800">{b.title}</span>
                  <span className="block text-sm text-slate-500">{b.description}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-white p-5 text-slate-600 shadow-card">Finish your first activity to earn a badge! 🏅</p>
        )}
      </section>
    </div>
  );
}

function Stat({ emoji, value, label }: { emoji: string; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-4 text-center shadow-card lg:flex-row lg:justify-start lg:gap-4 lg:text-left">
      <span className="text-3xl" aria-hidden>{emoji}</span>
      <span>
        <span className="block text-2xl font-bold text-slate-900">{value}</span>
        <span className="block text-sm text-slate-500">{label}</span>
      </span>
    </div>
  );
}

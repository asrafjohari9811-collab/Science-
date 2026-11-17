'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LEVEL_LABEL, getUnit, type Activity, type Response } from '@/lib/content';
import { describeAnswer, grade, isComplete } from '@/lib/grading';
import { starsFor } from '@/lib/progress';
import {
  AuthError, applyLocalAnswer, chooseState, emptyAttempt, newId, type AttemptState,
} from '@/lib/sync/queue';
import { QuestionInput, instructionFor } from '@/components/questions/QuestionInput';
import { Visual } from '@/components/questions/Visual';
import { SpeakButton } from '@/components/SpeakButton';
import { ProgressBar, Spinner, Stars, btn } from '@/components/ui';
import { SaveIndicator } from './SaveIndicator';
import { useStudent } from './StudentProvider';

const PRAISE = ['Great job!', 'Well done!', 'Excellent!', 'Super!', "You're becoming a Science Explorer!"];
const ENCOURAGE = ['Keep trying!', 'Good try!', 'Nice effort!', 'Almost there!'];
const pick = (list: string[], seed: number) => list[seed % list.length];

type Phase = 'loading' | 'question' | 'feedback' | 'done' | 'error';

export function ActivityPlayer({ activity, restart }: { activity: Activity; restart: boolean }) {
  const { store, transport, flush, onFlush, online } = useStudent();
  const router = useRouter();
  const unit = getUnit(activity.unitId)!;
  const total = activity.questions.length;

  const [phase, setPhase] = useState<Phase>('loading');
  const [attempt, setAttempt] = useState<AttemptState | null>(null);
  const [response, setResponse] = useState<Response | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [resumedAt, setResumedAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const attemptRef = useRef<AttemptState | null>(null);
  attemptRef.current = attempt;

  const show = useCallback((s: AttemptState) => {
    store.saveAttempt(s);
    setAttempt(s);
    setResponse(null);
    setPhase(s.status === 'completed' ? 'done' : 'question');
  }, [store]);

  // Load: send anything waiting, then resume the open attempt (or start one).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = store.attempt(activity.id);
      let server: AttemptState | null = null;
      try {
        await flush();
        if (restart) {
          // Explicit "Start again": a new attempt id, created on the server now or when back online.
          const fresh = emptyAttempt(activity.id, newId(), total, (local?.attempt_no ?? 0) + 1);
          store.enqueue({ kind: 'start', eventId: newId(), activityId: activity.id, attemptId: fresh.attempt_id, restart: true, createdAt: new Date().toISOString() });
          store.saveAttempt(fresh);
          router.replace(`/learn/${activity.id}`); // so a page refresh does not restart again
          void flush();
          if (!cancelled) show(fresh);
          return;
        }
        if (navigator.onLine) server = (await transport.startAttempt(activity.id, null, false)).state ?? null;
      } catch (e) {
        if (e instanceof AuthError) {
          router.replace('/login');
          return;
        }
        // Offline or server unreachable: carry on with what this device has.
      }
      if (cancelled) return;

      const usableLocal = local && local.status === 'in_progress' ? local : null;
      let state = chooseState(usableLocal, server, store.queue());
      if (!state) {
        state = emptyAttempt(activity.id, newId(), total);
        store.enqueue({ kind: 'start', eventId: newId(), activityId: activity.id, attemptId: state.attempt_id, restart: false, createdAt: new Date().toISOString() });
      }
      if (state.current_index > 0 && state.status === 'in_progress') setResumedAt(state.current_index);
      show(state);
    })();
    return () => {
      cancelled = true;
    };
    // Runs once per activity on purpose (restart is read only on first load).
  }, [activity.id]);

  // When queued answers reach the server, adopt the server's copy (the source of truth).
  useEffect(
    () =>
      onFlush((o) => {
        const cur = attemptRef.current;
        if (!cur) return;
        const s = o.states[activity.id];
        if (o.conflicts.includes(activity.id)) {
          // Progress was saved from another device; load the saved copy.
          void transport.startAttempt(activity.id, null, false).then((r) => {
            if (r.state) {
              setNotice('We loaded your latest saved work.');
              show(r.state);
            }
          }).catch(() => undefined);
          return;
        }
        const waiting = store.queue().some((op) => op.attemptId === cur.attempt_id);
        if (s && s.attempt_id === cur.attempt_id && !waiting && s.current_index >= cur.current_index) {
          store.saveAttempt(s);
          setAttempt((prev) => (prev && prev.attempt_id === s.attempt_id ? { ...s } : prev));
        }
      }),
    [activity.id, onFlush, show, store, transport],
  );

  const submit = () => {
    if (!attempt || !response) return;
    const index = attempt.current_index;
    const q = activity.questions[index];
    if (!isComplete(q, response)) return;
    const correct = grade(q, response);
    const answeredAt = new Date().toISOString();
    // 1) Save on this device first, 2) queue for the server, 3) try to send now.
    const next = applyLocalAnswer(attempt, { question_index: index, question_id: q.id, response, is_correct: correct, answered_at: answeredAt });
    store.saveAttempt(next);
    store.enqueue({ kind: 'answer', eventId: newId(), activityId: activity.id, attemptId: attempt.attempt_id, questionIndex: index, questionId: q.id, response, answeredAt });
    setAttempt(next);
    setLastCorrect(correct);
    setPhase('feedback');
    setResumedAt(null);
    void flush();
  };

  const goNext = () => {
    if (!attempt) return;
    setResponse(null);
    setPhase(attempt.status === 'completed' ? 'done' : 'question');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (phase === 'loading' || !attempt) return <Spinner label="Getting your activity ready…" />;

  // ----- Score summary --------------------------------------------------------
  if (phase === 'done') {
    const score = attempt.correct_count;
    const stars = starsFor(score, total);
    return (
      <div className="mx-auto max-w-2xl animate-pop text-center">
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-card sm:p-10">
          <p className="text-6xl" aria-hidden>{stars === 3 ? '🏆' : stars === 2 ? '🌟' : '💪'}</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-900">{stars === 3 ? 'Amazing work!' : stars === 2 ? 'Well done!' : 'Good effort!'}</h1>
          <p className="mt-2 text-lg text-slate-600">You finished <strong>{activity.title}</strong>.</p>
          <div className="mt-6 flex justify-center"><Stars count={stars} size="lg" /></div>
          <p className="mt-4 text-4xl font-bold text-brand-700">{score} / {total}</p>
          <p className="text-slate-500">correct answers</p>
          <div className="mt-4 flex justify-center"><SaveIndicator /></div>
          {stars < 3 && <p className="mt-4 text-slate-600">Try again to earn more stars. You can do it!</p>}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href={`/units/${unit.id}`} className={btn.primary}>Back to Unit {unit.id}</Link>
            <Link href={`/learn/${activity.id}/review`} className={btn.secondary}>Review answers</Link>
            <Link href={`/learn/${activity.id}?restart=1`} className={btn.secondary}>Try again</Link>
          </div>
        </div>
      </div>
    );
  }

  // ----- Question / feedback -------------------------------------------------
  const index = phase === 'feedback' ? attempt.current_index - 1 : attempt.current_index;
  const q = activity.questions[index];
  const locked = phase === 'feedback';
  const shownResponse = locked ? (attempt.answers.find((a) => a.question_index === index)?.response ?? response) : response;
  const ready = !!response && isComplete(q, response);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/units/${unit.id}`} className="inline-flex items-center gap-1 text-base font-medium text-slate-500 hover:text-brand-700">
          <span aria-hidden>←</span> Unit {unit.id}: {unit.title}
        </Link>
        <SaveIndicator />
      </div>

      <div className="mb-6">
        <div className="mb-2 flex flex-col gap-0.5 text-sm font-medium text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>{LEVEL_LABEL[activity.level]} · {activity.title}</span>
          <span className="font-semibold text-slate-700">Question {index + 1} of {total}</span>
        </div>
        <ProgressBar value={((locked ? index + 1 : index) / total) * 100} status="in_progress" label="Activity progress" />
      </div>

      {resumedAt !== null && (
        <div className="mb-4 animate-rise rounded-2xl bg-brand-50 px-5 py-3 text-brand-800">
          Welcome back! You are continuing from question {resumedAt + 1}.
        </div>
      )}
      {notice && <div className="mb-4 rounded-2xl bg-amber-50 px-5 py-3 text-amber-800">{notice}</div>}
      {!online && (
        <div className="mb-4 rounded-2xl bg-slate-100 px-5 py-3 text-slate-700">
          You are offline. Keep going — your answers are saved on this device and will sync later.
        </div>
      )}

      <section key={q.id} className="animate-rise rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8" aria-live="polite">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="whitespace-pre-line text-2xl font-semibold leading-snug text-slate-900">{q.prompt}</h1>
          <SpeakButton text={`${q.prompt}. ${instructionFor(q)}`} />
        </div>
        <p className="mt-2 text-base text-slate-500">{instructionFor(q)}</p>
        {q.visual && <div className="my-6 flex justify-center"><Visual visual={q.visual} /></div>}
        <div className="mt-6">
          <QuestionInput question={q} response={shownResponse} onChange={setResponse} locked={locked} />
        </div>

        {locked && (
          <div className={`mt-6 animate-pop rounded-2xl p-5 ${lastCorrect ? 'bg-leaf-50 text-leaf-700' : 'bg-amber-50 text-amber-900'}`} role="status">
            <p className="text-2xl font-bold">{lastCorrect ? `✅ ${pick(PRAISE, index)}` : `💡 ${pick(ENCOURAGE, index)}`}</p>
            {!lastCorrect && (
              <p className="mt-2 text-lg"><span className="font-semibold">The answer is:</span> {describeAnswer(q)}</p>
            )}
            <p className="mt-2 text-lg">{q.explanation}</p>
          </div>
        )}
      </section>

      <div className="mt-6 flex justify-end">
        {locked ? (
          <button type="button" onClick={goNext} className={btn.primary} autoFocus>
            {attempt.status === 'completed' ? 'See my score' : 'Next question'} <span aria-hidden>→</span>
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!ready} className={btn.primary}>
            Check my answer
          </button>
        )}
      </div>
    </div>
  );
}

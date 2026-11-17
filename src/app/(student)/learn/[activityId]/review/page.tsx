'use client';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LEVEL_LABEL, getActivity } from '@/lib/content';
import { describeAnswer, describeResponse } from '@/lib/grading';
import type { AttemptState, SavedAnswer } from '@/lib/sync/queue';
import { useStudent } from '@/components/student/StudentProvider';
import { Card, EmptyState, Spinner, btn } from '@/components/ui';

export default function ReviewPage() {
  const { activityId } = useParams<{ activityId: string }>();
  const activity = getActivity(activityId);
  const { supabase, student, store } = useStudent();
  const [answers, setAnswers] = useState<SavedAnswer[] | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    if (!activity) return;
    (async () => {
      const { data: att } = await supabase
        .from('activity_attempts')
        .select('id, correct_count, total_questions')
        .eq('student_id', student.id)
        .eq('activity_id', activity.id)
        .eq('status', 'completed')
        .order('attempt_no', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (att) {
        const { data } = await supabase
          .from('attempt_answers')
          .select('question_index, question_id, response, is_correct')
          .eq('attempt_id', att.id)
          .order('question_index');
        setAnswers((data ?? []) as SavedAnswer[]);
        setScore({ correct: att.correct_count, total: att.total_questions });
        return;
      }
      // Offline, or finished on this device but not synced yet.
      const local: AttemptState | null = store.attempt(activity.id);
      if (local?.status === 'completed') {
        setAnswers(local.answers);
        setScore({ correct: local.correct_count, total: local.total_questions });
      } else setAnswers([]);
    })();
  }, [activity, supabase, student.id, store]);

  if (!activity) notFound();
  if (answers === null) return <Spinner label="Loading your answers…" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/units/${activity.unitId}`} className="inline-flex items-center gap-1 font-medium text-slate-500 hover:text-brand-700"><span aria-hidden>←</span> Back to unit</Link>
      <div>
        <p className="font-semibold text-brand-600">{LEVEL_LABEL[activity.level]}</p>
        <h1 className="text-3xl font-bold text-slate-900">Review: {activity.title}</h1>
        {score && <p className="mt-1 text-lg text-slate-600">You got {score.correct} out of {score.total} correct.</p>}
      </div>
      {answers.length === 0 ? (
        <EmptyState title="Nothing to review yet">Finish this activity first, then come back to see your answers.</EmptyState>
      ) : (
        activity.questions.map((q, i) => {
          const a = answers.find((x) => x.question_index === i);
          return (
            <Card key={q.id}>
              <p className="text-sm font-medium text-slate-500">Question {i + 1}</p>
              <p className="mt-1 whitespace-pre-line text-xl font-semibold text-slate-900">{q.prompt}</p>
              <p className={`mt-3 rounded-xl px-4 py-2 ${a?.is_correct ? 'bg-leaf-50 text-leaf-700' : 'bg-amber-50 text-amber-900'}`}>
                <span className="font-semibold">{a?.is_correct ? '✅ Your answer:' : '💡 Your answer:'}</span> {describeResponse(q, a?.response)}
              </p>
              {!a?.is_correct && <p className="mt-2 text-slate-700"><span className="font-semibold">Correct answer:</span> {describeAnswer(q)}</p>}
              <p className="mt-2 text-slate-600">{q.explanation}</p>
            </Card>
          );
        })
      )}
      <div className="flex flex-wrap gap-3">
        <Link href={`/learn/${activity.id}?restart=1`} className={btn.primary}>Try again</Link>
        <Link href={`/units/${activity.unitId}`} className={btn.secondary}>Back to unit</Link>
      </div>
    </div>
  );
}

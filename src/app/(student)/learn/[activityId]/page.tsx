'use client';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getActivity } from '@/lib/content';
import { ActivityPlayer } from '@/components/student/ActivityPlayer';
import { Spinner } from '@/components/ui';

function LearnInner() {
  const { activityId } = useParams<{ activityId: string }>();
  const search = useSearchParams();
  const activity = getActivity(activityId);
  if (!activity) notFound();
  return <ActivityPlayer key={activity.id} activity={activity} restart={search.get('restart') === '1'} />;
}

export default function LearnPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LearnInner />
    </Suspense>
  );
}

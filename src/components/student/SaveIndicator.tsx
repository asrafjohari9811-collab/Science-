'use client';
import { useStudent } from './StudentProvider';

/** Small status line so pupils (and teachers watching) know work is safe. */
export function SaveIndicator() {
  const { saveStatus, pending, online } = useStudent();
  let text = '';
  let tone = 'text-slate-500';
  if (saveStatus === 'saving') text = 'Saving…';
  else if (!online || saveStatus === 'offline') {
    text = pending ? 'Saved on this device. It will sync when you are online.' : 'You are offline.';
    tone = 'text-amber-700';
  } else if (saveStatus === 'signin') {
    text = 'Please log in again to save your work.';
    tone = 'text-amber-700';
  } else if (saveStatus === 'error') {
    text = 'Saved on this device. Trying again soon…';
    tone = 'text-amber-700';
  } else if (saveStatus === 'saved') {
    text = 'Your progress has been saved!';
    tone = 'text-leaf-700';
  }
  if (!text) return null;
  return (
    <p className={`inline-flex items-center gap-2 text-sm font-medium ${tone}`} role="status" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${tone.includes('leaf') ? 'bg-leaf-500' : tone.includes('amber') ? 'bg-amber-500' : 'animate-pulse bg-brand-400'}`} aria-hidden />
      {text}
    </p>
  );
}

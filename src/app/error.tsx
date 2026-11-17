'use client';
import { btn } from '@/components/ui';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl" aria-hidden>🧪</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">Oops! Something went wrong</h1>
      <p className="mt-2 text-lg text-slate-600">Your saved work is safe. Please try again.</p>
      {error.digest && <p className="mt-2 font-mono text-xs text-slate-400">Ref: {error.digest}</p>}
      <button type="button" onClick={reset} className={`${btn.primary} mt-6`}>Try again</button>
    </main>
  );
}

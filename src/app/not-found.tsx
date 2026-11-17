import Link from 'next/link';
import { btn } from '@/components/ui';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-6xl" aria-hidden>🔭</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">We could not find that page</h1>
      <p className="mt-2 text-lg text-slate-600">Let’s go back and keep exploring.</p>
      <Link href="/" className={`${btn.primary} mt-6`}>Go home</Link>
    </main>
  );
}

import Link from 'next/link';
import { Logo } from '@/components/ui';
import { SetupNotice } from '@/components/SetupNotice';
import { UnitIcon, UNIT_TINT } from '@/components/UnitIcon';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8 sm:py-12">
      <header className="flex items-center justify-between">
        <Logo />
      </header>

      <section className="mt-12 text-center sm:mt-20">
        <div className="mx-auto mb-8 flex max-w-md justify-center gap-3" aria-hidden>
          {[1, 5, 6, 7, 9].map((id) => (
            <span key={id} className={`grid h-14 w-14 place-items-center rounded-2xl ${UNIT_TINT[id]}`}>
              <UnitIcon unitId={id} className="h-8 w-8" />
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Science Quest – Year 2</h1>
        <p className="mt-3 text-xl font-medium text-brand-600 sm:text-2xl">Explore. Learn. Discover.</p>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Ten science units, fun activities and your very own progress tracker.
        </p>
      </section>

      <div className="mt-8"><SetupNotice /></div>

      <section className="mx-auto mt-10 grid w-full max-w-3xl gap-5 sm:grid-cols-2">
        <Link href="/login" className="group rounded-3xl border-2 border-brand-100 bg-white p-8 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300">
          <span className="text-5xl" aria-hidden>🧒</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">I am a Pupil</h2>
          <p className="mt-1 text-slate-600">Log in with your Student ID and secret code.</p>
          <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-700">Start learning <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
        </Link>
        <Link href="/teacher/login" className="group rounded-3xl border-2 border-slate-100 bg-white p-8 shadow-card transition hover:-translate-y-0.5 hover:border-slate-300">
          <span className="text-5xl" aria-hidden>👩‍🏫</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">I am a Teacher</h2>
          <p className="mt-1 text-slate-600">See your class progress and reports.</p>
          <span className="mt-5 inline-flex items-center gap-2 font-semibold text-slate-700">Teacher login <span aria-hidden className="transition group-hover:translate-x-1">→</span></span>
        </Link>
      </section>

      <footer className="mt-auto pt-16 text-center text-sm text-slate-400">
        Based on KSSR Science Year 2 (DLP, Revised 2017).
      </footer>
    </main>
  );
}

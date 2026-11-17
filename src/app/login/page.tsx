'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { isConfigured } from '@/lib/env';
import { STUDENT_CODE_PATTERN, normalizeAccessCode, normalizeStudentCode, studentEmail } from '@/lib/student-account';
import { Logo, btn } from '@/components/ui';
import { clearPageCache } from '@/lib/signout';

type Step = 'credentials' | 'confirm';

export default function StudentLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('credentials');
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const studentCode = normalizeStudentCode(code);
    if (!STUDENT_CODE_PATTERN.test(studentCode)) {
      setError('Please check your Student ID. Ask your teacher if you are not sure.');
      return;
    }
    if (normalizeAccessCode(secret).length < 6) {
      setError('Your secret code has 6 letters or numbers.');
      return;
    }
    if (!isConfigured()) {
      setError('The app is not connected to its database yet. Please tell your teacher.');
      return;
    }
    setBusy(true);
    const supabase = getBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email: studentEmail(studentCode), password: normalizeAccessCode(secret) });
    if (authError) {
      setBusy(false);
      setError(/fetch|network/i.test(authError.message)
        ? 'We cannot connect right now. Please check the internet and try again.'
        : 'Your Student ID or secret code is not right. Please try again.');
      return;
    }
    const { data: student } = await supabase.from('students').select('full_name').maybeSingle();
    setBusy(false);
    if (!student) {
      await supabase.auth.signOut();
      setError('This account is not a pupil account. Teachers, please use Teacher login.');
      return;
    }
    setName(student.full_name);
    setStep('confirm');
  };

  const confirm = async (yes: boolean) => {
    if (yes) {
      await clearPageCache(); // shared devices: never show the previous pupil's cached pages
      try {
        sessionStorage.removeItem('sq:welcomed');
      } catch {
        /* ignore */
      }
      router.replace('/dashboard');
      router.refresh();
    } else {
      void getBrowserClient().auth.signOut();
      setStep('credentials');
      setSecret('');
      setError('Please type your own Student ID and secret code.');
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col px-5 py-8">
      <Link href="/" className="self-start"><Logo /></Link>
      <div className="mt-10 rounded-3xl border border-slate-100 bg-white p-7 shadow-card sm:p-9">
        {step === 'credentials' ? (
          <form onSubmit={signIn} noValidate>
            <p className="text-5xl" aria-hidden>👋</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">Hello, Science Explorer!</h1>
            <p className="mt-1 text-lg text-slate-600">Type your Student ID and secret code.</p>

            <label htmlFor="code" className="mt-7 block text-lg font-semibold text-slate-800">Student ID</label>
            <input id="code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="username" autoCapitalize="characters" spellCheck={false}
              placeholder="e.g. SQ-2A-001"
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-2xl font-semibold uppercase tracking-wide outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />

            <label htmlFor="secret" className="mt-5 block text-lg font-semibold text-slate-800">Secret code</label>
            <input id="secret" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} autoComplete="current-password" autoCapitalize="characters" spellCheck={false}
              placeholder="6 letters or numbers" maxLength={12}
              className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-5 py-4 text-2xl font-semibold uppercase tracking-[0.3em] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />

            {error && <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-amber-900" role="alert">{error}</p>}

            <button type="submit" disabled={busy} className={`${btn.primary} mt-7 w-full py-4 text-xl`}>
              {busy ? 'Checking…' : "Let's go!"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-6xl" aria-hidden>🧑‍🔬</p>
            <h1 className="mt-4 text-3xl font-bold text-slate-900">Are you {name}?</h1>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <button type="button" onClick={() => confirm(true)} className={`${btn.success} py-5 text-xl`}>Yes, that's me</button>
              <button type="button" onClick={() => confirm(false)} className={`${btn.secondary} py-5 text-xl`}>No</button>
            </div>
          </div>
        )}
      </div>
      <p className="mt-6 text-center text-slate-500">Forgot your code? Ask your teacher.</p>
    </main>
  );
}

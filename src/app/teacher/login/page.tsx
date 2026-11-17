'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { isConfigured } from '@/lib/env';
import { Logo, btn } from '@/components/ui';
import { SetupNotice } from '@/components/SetupNotice';

export default function TeacherLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isConfigured()) {
      setError('Supabase is not configured. See the setup notice above.');
      return;
    }
    setBusy(true);
    const supabase = getBrowserClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError || !data.user) {
      setBusy(false);
      setError('Email or password is incorrect.');
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
    if (profile?.role !== 'teacher') {
      await supabase.auth.signOut();
      setBusy(false);
      setError('This account does not have teacher access. See docs/SETUP.md → "Create a teacher account".');
      return;
    }
    router.replace('/teacher');
    router.refresh();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-8">
      <Link href="/" className="self-start"><Logo /></Link>
      <div className="mt-6"><SetupNotice /></div>
      <form onSubmit={submit} className="mt-8 rounded-3xl border border-slate-100 bg-white p-7 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">Teacher login</h1>
        <p className="mt-1 text-slate-600">Sign in to view class progress and reports.</p>
        <label htmlFor="email" className="mt-6 block font-semibold text-slate-800">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
          className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
        <label htmlFor="password" className="mt-4 block font-semibold text-slate-800">Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
          className="mt-2 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-lg outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100" />
        {error && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-amber-900" role="alert">{error}</p>}
        <button type="submit" disabled={busy} className={`${btn.primary} mt-6 w-full`}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

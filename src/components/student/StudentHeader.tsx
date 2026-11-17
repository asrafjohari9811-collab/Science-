'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Logo, btn } from '@/components/ui';
import { signOutEverywhere } from '@/lib/signout';
import { useStudent } from './StudentProvider';

export function StudentHeader() {
  const { student, pending, flush } = useStudent();
  const [warn, setWarn] = useState(false);

  const logout = async () => {
    // Try to send everything first so no answers are left behind on a shared device.
    const outcome = await flush();
    if ((outcome?.remaining ?? pending) > 0 && !warn) {
      setWarn(true);
      return;
    }
    await signOutEverywhere('/login');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" aria-label="My dashboard"><Logo /></Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-right sm:block">
            <span className="block font-semibold text-slate-800">{student.fullName}</span>
            <span className="block text-xs text-slate-500">{student.className ?? student.studentCode}</span>
          </span>
          <button type="button" onClick={logout} className={btn.small}>Log out</button>
        </div>
      </div>
      {warn && (
        <div className="bg-amber-50 px-4 py-3 text-center text-amber-900">
          Some answers have not reached the internet yet. Connect to the internet first, or press <strong>Log out</strong> again to log out anyway
          (those answers stay on this device and are sent next time you log in here).
        </div>
      )}
    </header>
  );
}

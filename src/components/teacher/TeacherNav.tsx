'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo, btn } from '@/components/ui';
import { signOutEverywhere } from '@/lib/signout';

const LINKS = [
  { href: '/teacher', label: 'Overview' },
  { href: '/teacher/students', label: 'Student Records' },
  { href: '/teacher/classes', label: 'Classes & Accounts' },
];

export function TeacherNav({ name }: { name: string }) {
  const path = usePathname();
  return (
    <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/teacher"><Logo /></Link>
          <nav className="flex gap-1" aria-label="Teacher">
            {LINKS.map((l) => {
              const active = l.href === '/teacher' ? path === l.href : path.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href} aria-current={active ? 'page' : undefined}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600">{name}</span>
          <button type="button" className={btn.small} onClick={() => signOutEverywhere('/teacher/login')}>Sign out</button>
        </div>
      </div>
    </header>
  );
}

import type { ReactNode } from 'react';
import type { Status } from '@/lib/progress';

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-lg font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-200',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3.5 text-lg font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700 active:scale-[0.98] disabled:opacity-50 focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-200',
  success:
    'inline-flex items-center justify-center gap-2 rounded-2xl bg-leaf-600 px-6 py-3.5 text-lg font-semibold text-white shadow-sm transition hover:bg-leaf-700 active:scale-[0.98] focus-visible:outline focus-visible:outline-4 focus-visible:outline-leaf-100',
  small:
    'inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50',
  smallPrimary:
    'inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50',
};

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-card ${className}`}>{children}</div>;
}

const STATUS_STYLE: Record<Status, { bar: string; pill: string; label: string }> = {
  completed: { bar: 'bg-leaf-500', pill: 'bg-leaf-50 text-leaf-700 ring-leaf-500/20', label: 'Completed' },
  in_progress: { bar: 'bg-brand-500', pill: 'bg-brand-50 text-brand-700 ring-brand-500/20', label: 'In Progress' },
  not_started: { bar: 'bg-slate-300', pill: 'bg-slate-100 text-slate-600 ring-slate-400/20', label: 'Not Started' },
};

export function ProgressBar({ value, status, size = 'md', label }: { value: number; status?: Status; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const s = status ?? (value >= 100 ? 'completed' : value > 0 ? 'in_progress' : 'not_started');
  const h = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-3';
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-slate-100 ${h}`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? 'Progress'}
    >
      <div className={`${h} rounded-full ${STATUS_STYLE[s].bar} transition-[width] duration-500`} style={{ width: `${v}%` }} />
    </div>
  );
}

export function StatusPill({ status, small = false }: { status: Status; small?: boolean }) {
  const st = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ring-1 ring-inset ${st.pill} ${small ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <span className={`h-2 w-2 rounded-full ${st.bar}`} aria-hidden />
      {st.label}
    </span>
  );
}

export function Stars({ count, max = 3, size = 'md' }: { count: number; max?: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';
  return (
    <span className="inline-flex gap-0.5" aria-label={`${count} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${cls} ${i < count ? 'fill-amber-400 stroke-amber-500' : 'fill-slate-100 stroke-slate-300'}`} strokeWidth={1.5} aria-hidden>
          <path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9L12 2.8z" strokeLinejoin="round" />
        </svg>
      ))}
    </span>
  );
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-500" role="status">
      <svg className="h-6 w-6 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
        <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="text-lg">{label}</span>
    </div>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
        <rect width="40" height="40" rx="12" className="fill-brand-600" />
        <path d="M16 10h8M17.5 10v8.5L11.5 28a2.5 2.5 0 002.1 3.8h12.8a2.5 2.5 0 002.1-3.8l-6-9.5V10" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="17" cy="26" r="1.6" fill="#86efac" />
        <circle cx="22.5" cy="24" r="1.2" fill="#86efac" />
      </svg>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-lg font-bold tracking-tight text-slate-900">Science Quest</span>
          <span className="block text-xs font-medium uppercase tracking-wider text-brand-600">Year 2</span>
        </span>
      )}
    </span>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
      <p className="text-lg font-semibold text-slate-700">{title}</p>
      {children && <div className="mt-2 text-slate-500">{children}</div>}
    </div>
  );
}

// Simple line illustrations for the 10 units (stroke uses currentColor).
import type { ReactElement } from 'react';

const paths: Record<number, ReactElement> = {
  1: (
    <>
      <circle cx="27" cy="27" r="13" />
      <path d="M36.5 36.5L50 50" strokeWidth="5" />
      <path d="M21 25a7 7 0 017-6" />
    </>
  ),
  2: (
    <>
      <path d="M32 8l18 7v13c0 12-8 21-18 25-10-4-18-13-18-25V15l18-7z" />
      <path d="M24 31l6 6 11-12" />
    </>
  ),
  3: (
    <>
      <circle cx="20" cy="18" r="5" />
      <path d="M20 23v14M14 30h12M20 37l-5 12M20 37l5 12" />
      <circle cx="44" cy="12" r="6" />
      <path d="M44 18v18M37 26h14M44 36l-6 15M44 36l6 15" />
    </>
  ),
  4: (
    <>
      <ellipse cx="32" cy="40" rx="11" ry="9" />
      <circle cx="17" cy="26" r="5" />
      <circle cx="26" cy="16" r="5" />
      <circle cx="38" cy="16" r="5" />
      <circle cx="47" cy="26" r="5" />
    </>
  ),
  5: (
    <>
      <path d="M32 54V28" />
      <path d="M32 34c-10 0-16-6-16-15 10 0 16 6 16 15zM32 28c0-9 6-15 16-15 0 9-6 15-16 15z" />
      <path d="M18 54h28" />
    </>
  ),
  6: (
    <>
      <circle cx="26" cy="30" r="9" />
      <path d="M26 12v4M26 44v4M8 30h4M40 30h4M13 17l3 3M36 40l3 3M13 43l3-3M36 20l3-3" />
      <path d="M50 38a9 9 0 01-11-11 9 9 0 1011 11z" />
    </>
  ),
  7: (
    <>
      <path d="M24 38a13 13 0 1116 0v6H24v-6z" />
      <path d="M26 50h12M28 44v-8l4-4 4 4v8" />
    </>
  ),
  8: (
    <>
      <path d="M22 10h20M26 10v14L14 48a4 4 0 003.6 6h28.8a4 4 0 003.6-6L38 24V10" />
      <path d="M19 40h26" />
      <circle cx="28" cy="47" r="1.5" fill="currentColor" />
      <circle cx="36" cy="45" r="1.5" fill="currentColor" />
    </>
  ),
  9: (
    <>
      <circle cx="32" cy="32" r="20" />
      <path d="M14 26h36M14 38h36M32 12c-6 6-8 13-8 20s2 14 8 20M32 12c6 6 8 13 8 20s-2 14-8 20" />
    </>
  ),
  10: (
    <>
      <rect x="10" y="34" width="20" height="16" rx="2" />
      <rect x="34" y="34" width="20" height="16" rx="2" />
      <rect x="22" y="14" width="20" height="16" rx="2" />
      <path d="M27 14v-3M37 14v-3M15 34v-3M25 34v-3M39 34v-3M49 34v-3" />
    </>
  ),
};

export const UNIT_TINT: Record<number, string> = {
  1: 'bg-sky-50 text-sky-600',
  2: 'bg-amber-50 text-amber-600',
  3: 'bg-rose-50 text-rose-500',
  4: 'bg-orange-50 text-orange-500',
  5: 'bg-emerald-50 text-emerald-600',
  6: 'bg-yellow-50 text-yellow-600',
  7: 'bg-violet-50 text-violet-600',
  8: 'bg-cyan-50 text-cyan-600',
  9: 'bg-blue-50 text-blue-600',
  10: 'bg-slate-100 text-slate-600',
};

export function UnitIcon({ unitId, className = 'h-12 w-12' }: { unitId: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[unitId]}
    </svg>
  );
}

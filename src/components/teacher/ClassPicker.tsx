'use client';
import { usePathname, useRouter } from 'next/navigation';

export function ClassPicker({ classes, selected }: { classes: { id: string; name: string }[]; selected: string | null }) {
  const router = useRouter();
  const path = usePathname();
  if (classes.length <= 1) return null;
  return (
    <label className="no-print inline-flex items-center gap-2 text-sm font-medium text-slate-600">
      Class
      <select
        value={selected ?? ''}
        onChange={(e) => router.push(e.target.value ? `${path}?class=${e.target.value}` : path)}
        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
      >
        <option value="">All my classes</option>
        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
  );
}

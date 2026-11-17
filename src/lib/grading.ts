// Client-side grading for instant feedback (works offline).
// The database re-grades every answer with sq_grade() in supabase/migrations/0003_functions.sql,
// and only the database result is stored, so scores cannot be faked from the browser.
import type { Question, Response } from './content/types';

const norm = (s: string) => s.trim().toLowerCase();

export function isComplete(q: Question, r: Response | null): boolean {
  if (!r) return false;
  switch (q.type) {
    case 'mcq':
    case 'yesno':
      return 'value' in r && !!r.value;
    case 'multi':
      return 'values' in r && r.values.length > 0;
    case 'match':
      return 'pairs' in r && q.left.every((l) => !!r.pairs[l.id]);
    case 'sort':
      return 'groups' in r && q.items.every((i) => !!r.groups[i.id]);
    case 'sequence':
      return 'order' in r && r.order.length === q.items.length;
    case 'fill':
      return 'blanks' in r && r.blanks.length === q.answer.blanks.length && r.blanks.every(Boolean);
  }
}

export function grade(q: Question, r: Response): boolean {
  const a = q.answer as Response;
  if ('value' in a && 'value' in r) return a.value === r.value;
  if ('values' in a && 'values' in r) {
    const x = [...a.values].sort();
    const y = [...new Set(r.values)].sort();
    return x.length === y.length && x.every((v, i) => v === y[i]);
  }
  if ('pairs' in a && 'pairs' in r) return sameRecord(a.pairs, r.pairs);
  if ('groups' in a && 'groups' in r) return sameRecord(a.groups, r.groups);
  if ('order' in a && 'order' in r) return a.order.length === r.order.length && a.order.every((v, i) => v === r.order[i]);
  if ('blanks' in a && 'blanks' in r)
    return a.blanks.length === r.blanks.length && a.blanks.every((v, i) => norm(v) === norm(r.blanks[i] ?? ''));
  return false;
}

function sameRecord(a: Record<string, string>, b: Record<string, string>): boolean {
  const ka = Object.keys(a);
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
}

/** Human-readable correct answer, shown with the explanation after a wrong answer. */
export function describeAnswer(q: Question): string {
  switch (q.type) {
    case 'mcq':
      return q.options.find((o) => o.id === q.answer.value)?.text ?? '';
    case 'yesno':
      return q.answer.value === 'yes' ? 'Yes' : 'No';
    case 'multi':
      return q.options.filter((o) => q.answer.values.includes(o.id)).map((o) => o.text).join(', ');
    case 'match':
      return q.left.map((l) => `${l.emoji ?? ''} ${l.text} → ${q.right.find((r) => r.id === q.answer.pairs[l.id])?.text}`.trim()).join(' · ');
    case 'sort':
      return q.groups
        .map((g) => `${g.text}: ${q.items.filter((i) => q.answer.groups[i.id] === g.id).map((i) => i.text).join(', ')}`)
        .join(' · ');
    case 'sequence':
      return q.answer.order.map((id) => q.items.find((i) => i.id === id)?.text).join(' → ');
    case 'fill': {
      let n = 0;
      return q.text.replace(/___/g, () => q.answer.blanks[n++]);
    }
  }
}

/** Short text version of what the pupil answered (for teacher reports). */
export function describeResponse(q: Question, r: Response | null | undefined): string {
  if (!r) return '—';
  const name = (list: { id: string; text: string }[], id: string) => list.find((x) => x.id === id)?.text ?? id;
  if (q.type === 'mcq' && 'value' in r) return name(q.options, r.value);
  if (q.type === 'yesno' && 'value' in r) return r.value === 'yes' ? 'Yes' : 'No';
  if (q.type === 'multi' && 'values' in r) return r.values.map((v) => name(q.options, v)).join(', ');
  if (q.type === 'match' && 'pairs' in r) return q.left.map((l) => `${l.text} → ${name(q.right, r.pairs[l.id] ?? '')}`).join(' · ');
  if (q.type === 'sort' && 'groups' in r) return q.items.map((i) => `${i.text}: ${name(q.groups, r.groups[i.id] ?? '')}`).join(' · ');
  if (q.type === 'sequence' && 'order' in r) return r.order.map((id) => name(q.items, id)).join(' → ');
  if (q.type === 'fill' && 'blanks' in r) return r.blanks.join(', ');
  return JSON.stringify(r);
}

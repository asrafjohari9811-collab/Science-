// Structural checks for the authored content. Used by the SQL generator and unit tests.
import { ACTIVITIES, UNITS } from './index';
import { grade } from '../grading';
import type { Question } from './types';

// Learning standards listed in DSKP KSSR Science Year 2 (Semakan 2017), pages 30–52.
export const DSKP_STANDARDS = new Set([
  '1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5',
  '2.1.1',
  '3.1.1', '3.1.2', '3.1.3', '3.1.4', '3.1.5', '3.1.6',
  '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', '4.1.7',
  '5.1.1', '5.1.2', '5.1.3', '5.1.4', '5.1.5', '5.1.6',
  '6.1.1', '6.1.2', '6.1.3', '6.1.4', '6.1.5', '6.1.6',
  '7.1.1', '7.1.2', '7.1.3', '7.1.4', '7.1.5', '7.1.6', '7.1.7',
  '8.1.1', '8.1.2', '8.1.3', '8.1.4', '8.1.5',
  '9.1.1', '9.1.2', '9.1.3', '9.1.4', '9.1.5', '9.2.1', '9.2.2', '9.2.3', '9.2.4', '9.2.5', '9.2.6',
  '10.1.1', '10.1.2', '10.1.3', '10.1.4', '10.1.5', '10.1.6',
]);

function ids(list: { id: string }[]) {
  return new Set(list.map((x) => x.id));
}

export function validateQuestion(q: Question): string[] {
  const p: string[] = [];
  const where = q.id;
  if (!q.prompt.trim()) p.push(`${where}: empty prompt`);
  if (!q.explanation.trim()) p.push(`${where}: empty explanation`);
  switch (q.type) {
    case 'mcq':
      if (q.options.length < 2) p.push(`${where}: needs 2+ options`);
      if (!ids(q.options).has(q.answer.value)) p.push(`${where}: answer not in options`);
      break;
    case 'multi':
      if (!q.answer.values.length) p.push(`${where}: no correct options`);
      if (q.answer.values.some((v) => !ids(q.options).has(v))) p.push(`${where}: answer not in options`);
      break;
    case 'match':
      if (q.left.length < 2) p.push(`${where}: needs 2+ pairs`);
      if (new Set(Object.values(q.answer.pairs)).size !== q.left.length) p.push(`${where}: pairs not one-to-one`);
      if (new Set(q.right.map((r) => r.text)).size !== q.right.length) p.push(`${where}: duplicate right-side labels`);
      break;
    case 'sort':
      if (q.groups.length < 2) p.push(`${where}: needs 2+ groups`);
      if (q.items.some((i) => !q.answer.groups[i.id])) p.push(`${where}: item without group`);
      break;
    case 'sequence':
      if (q.items.length < 3) p.push(`${where}: needs 3+ items`);
      break;
    case 'fill':
      if (q.answer.blanks.some((b) => !q.bank.includes(b))) p.push(`${where}: answer not in word bank`);
      break;
  }
  if (!grade(q, q.answer)) p.push(`${where}: answer key does not grade as correct`);
  return p;
}

export function validateContent(): string[] {
  const p: string[] = [];
  if (UNITS.length !== 10) p.push(`expected 10 units, found ${UNITS.length}`);
  const seenQ = new Set<string>();
  const seenPrompts = new Map<string, string>();
  for (const u of UNITS) {
    if (u.activities.length < 3) p.push(`unit ${u.id}: fewer than 3 activities`);
    for (const lvl of [1, 2, 3, 4]) if (!u.activities.some((a) => a.level === lvl)) p.push(`unit ${u.id}: missing level ${lvl}`);
    for (const s of u.standards) if (!DSKP_STANDARDS.has(s)) p.push(`unit ${u.id}: unknown standard ${s}`);
  }
  for (const a of ACTIVITIES) {
    if (a.questions.length < 5) p.push(`${a.id}: fewer than 5 questions`);
    if (!a.standards.length) p.push(`${a.id}: no standards listed`);
    for (const s of a.standards) {
      if (!DSKP_STANDARDS.has(s)) p.push(`${a.id}: unknown standard ${s}`);
      if (!s.startsWith(a.unitId + '.')) p.push(`${a.id}: standard ${s} belongs to another unit`);
    }
    for (const q of a.questions) {
      if (seenQ.has(q.id)) p.push(`duplicate question id ${q.id}`);
      seenQ.add(q.id);
      const key = q.prompt.toLowerCase().replace(/\s+/g, ' ').trim();
      const dup = seenPrompts.get(key);
      // A generic prompt like "Complete the sentence." is fine; a repeated specific prompt is not.
      if (dup && key.length > 40) p.push(`${q.id}: same prompt as ${dup}`);
      seenPrompts.set(key, q.id);
      p.push(...validateQuestion(q));
    }
  }
  return p;
}

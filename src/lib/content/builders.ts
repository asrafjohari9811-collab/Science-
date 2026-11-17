// Small helpers that keep the unit files short and readable.
// Each helper returns a question "draft" without id/position; activity() numbers them.
import type { Activity, Choice, Level, Question, Visual } from './types';

type DistOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type Draft = DistOmit<Question, 'id' | 'position'>;

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

/** "🐔 chicken" -> { emoji: "🐔", text: "chicken" }. Text without a leading emoji is kept as is. */
function parseLabel(label: string, id: string): Choice {
  const m = label.match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s+(.+)$/u);
  return m ? { id, emoji: m[1], text: m[2] } : { id, text: label };
}

function choices(labels: string[], prefix = ''): Choice[] {
  return labels.map((l, i) => parseLabel(l, prefix + LETTERS[i]));
}

interface Extra { visual?: Visual }
export const emoji = (value: string, caption?: string): Visual => ({ kind: 'emoji', value, caption });

/** Single-choice question. `correct` is the 0-based index of the right option. */
export function mcq(prompt: string, options: string[], correct: number, explanation: string, extra: Extra = {}): Draft {
  const opts = choices(options);
  if (!opts[correct]) throw new Error(`mcq correct index out of range: ${prompt}`);
  return { type: 'mcq', prompt, options: opts, answer: { value: opts[correct].id }, explanation, ...extra };
}

export function yesno(prompt: string, answer: boolean, explanation: string, extra: Extra = {}): Draft {
  return { type: 'yesno', prompt, answer: { value: answer ? 'yes' : 'no' }, explanation, ...extra };
}

/** Select all that apply. `correct` lists 0-based indexes. */
export function multi(prompt: string, options: string[], correct: number[], explanation: string, extra: Extra = {}): Draft {
  const opts = choices(options);
  return { type: 'multi', prompt, options: opts, answer: { values: correct.map((i) => opts[i].id).sort() }, explanation, ...extra };
}

/** Match pairs. Each pair is [left label, right label]; the right side is shuffled on screen. */
export function match(prompt: string, pairs: [string, string][], explanation: string, extra: Extra = {}): Draft {
  const left = pairs.map(([l], i) => parseLabel(l, 'l' + LETTERS[i]));
  const right = pairs.map(([, r], i) => parseLabel(r, 'r' + LETTERS[i]));
  const answer: Record<string, string> = {};
  left.forEach((l, i) => (answer[l.id] = right[i].id));
  return { type: 'match', prompt, left, right, answer: { pairs: answer }, explanation, ...extra };
}

/** Sort items into groups. `groups` maps a group label to the item labels that belong in it. */
export function sort(prompt: string, groups: Record<string, string[]>, explanation: string, extra: Extra = {}): Draft {
  const groupChoices = Object.keys(groups).map((g, i) => parseLabel(g, 'g' + LETTERS[i]));
  const items: Choice[] = [];
  const answer: Record<string, string> = {};
  let n = 0;
  Object.values(groups).forEach((labels, gi) => {
    for (const label of labels) {
      const id = 'i' + (++n);
      items.push(parseLabel(label, id));
      answer[id] = groupChoices[gi].id;
    }
  });
  return { type: 'sort', prompt, groups: groupChoices, items, answer: { groups: answer }, explanation, ...extra };
}

/** Put items in order. Give them in the CORRECT order; the screen shuffles them. */
export function sequence(prompt: string, ordered: string[], explanation: string, extra: Extra = {}): Draft {
  const items = ordered.map((l, i) => parseLabel(l, 's' + (i + 1)));
  return { type: 'sequence', prompt, items, answer: { order: items.map((i) => i.id) }, explanation, ...extra };
}

/** Fill in the blanks from a word bank. Mark blanks in `text` with "___" and list answers in order. */
export function fill(prompt: string, text: string, answers: string[], distractors: string[], explanation: string, extra: Extra = {}): Draft {
  const blanks = (text.match(/___/g) || []).length;
  if (blanks !== answers.length) throw new Error(`fill: ${blanks} blanks but ${answers.length} answers in "${text}"`);
  const bank = Array.from(new Set([...answers, ...distractors]));
  return { type: 'fill', prompt, text, bank, answer: { blanks: answers }, explanation, ...extra };
}

export function activity(
  unitId: number,
  level: Level,
  meta: { title: string; skill: string; instructions: string; standards: string[] },
  drafts: Draft[],
): Activity {
  const id = `u${String(unitId).padStart(2, '0')}-${level === 4 ? 'as' : 'l' + level}`;
  const questions = drafts.map((d, i) => ({ ...d, id: `${id}-q${String(i + 1).padStart(2, '0')}`, position: i + 1 }) as Question);
  return { id, unitId, level, ...meta, questions };
}

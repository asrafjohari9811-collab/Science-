import type { Activity, Question, Unit } from './types';
import { unit01 } from './units/u01';
import { unit02 } from './units/u02';
import { unit03 } from './units/u03';
import { unit04 } from './units/u04';
import { unit05 } from './units/u05';
import { unit06 } from './units/u06';
import { unit07 } from './units/u07';
import { unit08 } from './units/u08';
import { unit09 } from './units/u09';
import { unit10 } from './units/u10';

export * from './types';

export const UNITS: Unit[] = [unit01, unit02, unit03, unit04, unit05, unit06, unit07, unit08, unit09, unit10];

export const ACTIVITIES: Activity[] = UNITS.flatMap((u) => u.activities);

const activityMap = new Map(ACTIVITIES.map((a) => [a.id, a]));
const unitMap = new Map(UNITS.map((u) => [u.id, u]));

export function getUnit(id: number): Unit | undefined {
  return unitMap.get(id);
}

export function getActivity(id: string): Activity | undefined {
  return activityMap.get(id);
}

export function getQuestion(activityId: string, index: number): Question | undefined {
  return activityMap.get(activityId)?.questions[index];
}

export const TOTAL_ACTIVITIES = ACTIVITIES.length;
export const TOTAL_QUESTIONS = ACTIVITIES.reduce((n, a) => n + a.questions.length, 0);

/** Deterministic shuffle (same order every time for the same seed) so a resumed question looks the same. */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Shuffle, but never return the original order (for sequence questions). */
export function shuffleNotSorted<T>(items: readonly T[], seed: string): T[] {
  for (let k = 0; k < 8; k++) {
    const s = seededShuffle(items, seed + ':' + k);
    if (s.some((x, i) => x !== items[i])) return s;
  }
  return items.slice().reverse();
}

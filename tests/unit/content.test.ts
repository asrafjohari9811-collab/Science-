import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVITIES, TOTAL_QUESTIONS, UNITS, seededShuffle, shuffleNotSorted } from '../../src/lib/content';
import { validateContent } from '../../src/lib/content/validate';
import { grade, isComplete } from '../../src/lib/grading';
import type { Question } from '../../src/lib/content';

test('content passes structural validation', () => {
  assert.deepEqual(validateContent(), []);
});

test('meets the minimum size from the brief', () => {
  assert.equal(UNITS.length, 10);
  assert.ok(ACTIVITIES.length >= 30, `activities: ${ACTIVITIES.length}`);
  assert.ok(TOTAL_QUESTIONS >= 150, `questions: ${TOTAL_QUESTIONS}`);
});

test('every unit has levels 1-3 plus an assessment', () => {
  for (const u of UNITS) assert.deepEqual(u.activities.map((a) => a.level), [1, 2, 3, 4]);
});

test('uses varied question formats in every unit', () => {
  for (const u of UNITS) {
    const types = new Set(u.activities.flatMap((a) => a.questions.map((q) => q.type)));
    assert.ok(types.size >= 4, `unit ${u.id} only uses ${[...types]}`);
  }
});

test('wrong answers grade as incorrect', () => {
  for (const a of ACTIVITIES) {
    for (const q of a.questions as Question[]) {
      let wrong: any;
      switch (q.type) {
        case 'mcq': wrong = { value: q.options.find((o) => o.id !== q.answer.value)!.id }; break;
        case 'yesno': wrong = { value: q.answer.value === 'yes' ? 'no' : 'yes' }; break;
        case 'multi': wrong = { values: q.answer.values.slice(1).length ? q.answer.values.slice(1) : q.options.filter((o) => !q.answer.values.includes(o.id)).map((o) => o.id) }; break;
        case 'match': { const p = { ...q.answer.pairs }; const [k1, k2] = Object.keys(p); [p[k1], p[k2]] = [p[k2], p[k1]]; wrong = { pairs: p }; break; }
        case 'sort': { const g = { ...q.answer.groups }; const first = q.items[0].id; g[first] = q.groups.find((x) => x.id !== g[first])!.id; wrong = { groups: g }; break; }
        case 'sequence': wrong = { order: [...q.answer.order].reverse() }; break;
        case 'fill': wrong = { blanks: q.answer.blanks.map(() => 'zzz') }; break;
      }
      assert.equal(grade(q, wrong), false, `${q.id} accepted a wrong answer`);
      assert.equal(isComplete(q, q.answer), true, `${q.id} answer key not complete`);
    }
  }
});

test('seeded shuffle is stable and sequence shuffle never shows the answer order', () => {
  const items = ['a', 'b', 'c', 'd'];
  assert.deepEqual(seededShuffle(items, 'x'), seededShuffle(items, 'x'));
  for (const a of ACTIVITIES) for (const q of a.questions) if (q.type === 'sequence') {
    const s = shuffleNotSorted(q.items, q.id);
    assert.notDeepEqual(s.map((i) => i.id), q.answer.order, q.id);
  }
});

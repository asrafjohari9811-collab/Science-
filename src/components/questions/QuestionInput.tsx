'use client';
// Interactive answer areas for every question type. Every drag-and-drop interaction also works
// by tapping (tap an item, then tap where it goes), which is easier on tablets and phones.
import { useMemo, useState, type DragEvent } from 'react';
import { seededShuffle, shuffleNotSorted } from '@/lib/content';
import type {
  Choice, FillQuestion, MatchQuestion, McqQuestion, MultiQuestion, Question, Response, SequenceQuestion, SortQuestion,
} from '@/lib/content/types';

interface Props<Q extends Question = Question> {
  question: Q;
  response: Response | null;
  onChange: (r: Response) => void;
  locked: boolean; // true after the answer is submitted
}

export function QuestionInput(props: Props) {
  const q = props.question;
  switch (q.type) {
    case 'mcq':
      return <McqInput {...(props as Props<McqQuestion>)} />;
    case 'yesno':
      return <YesNoInput {...props} />;
    case 'multi':
      return <MultiInput {...(props as Props<MultiQuestion>)} />;
    case 'match':
      return <MatchInput {...(props as Props<MatchQuestion>)} />;
    case 'sort':
      return <SortInput {...(props as Props<SortQuestion>)} />;
    case 'sequence':
      return <SequenceInput {...(props as Props<SequenceQuestion>)} />;
    case 'fill':
      return <FillInput {...(props as Props<FillQuestion>)} />;
  }
}

export function instructionFor(q: Question): string {
  switch (q.type) {
    case 'mcq': return 'Choose one answer.';
    case 'yesno': return 'Choose Yes or No.';
    case 'multi': return 'Choose all the correct answers.';
    case 'match': return 'Tap a word on the left, then tap its match on the right. You can also drag.';
    case 'sort': return 'Tap a card, then tap the group it belongs to. You can also drag.';
    case 'sequence': return 'Tap the cards in the correct order.';
    case 'fill': return 'Tap a word to fill the next blank. Tap a blank to clear it.';
  }
}

// ---------------------------------------------------------------------------
const base =
  'relative flex items-center gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-left text-lg font-medium text-slate-800 transition focus-visible:outline focus-visible:outline-4 focus-visible:outline-brand-200 disabled:cursor-default';
const idle = 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/40';
const chosen = 'border-brand-500 bg-brand-50 ring-2 ring-brand-200';
const right = 'border-leaf-500 bg-leaf-50';
const wrong = 'border-amber-400 bg-amber-50';

const hasLetters = (s: string) => /\p{L}|\p{N}/u.test(s);

function ChoiceLabel({ c }: { c: Choice }) {
  // A picture-only card (e.g. a baby emoji in a matching question) is shown large.
  if (!c.emoji && !hasLetters(c.text)) {
    return <span className="text-5xl leading-none" role="img" aria-label="picture">{c.text}</span>;
  }
  return (
    <>
      {c.emoji && <span className="text-3xl leading-none" aria-hidden>{c.emoji}</span>}
      <span>{c.text}</span>
    </>
  );
}

function McqInput({ question: q, response, onChange, locked }: Props<McqQuestion>) {
  const value = response && 'value' in response ? response.value : null;
  return (
    <div className={`grid gap-3 ${q.options.length === 4 ? 'sm:grid-cols-2' : q.options.length <= 3 ? 'sm:grid-cols-1' : 'sm:grid-cols-2'}`} role="radiogroup">
      {q.options.map((o) => {
        const isChosen = value === o.id;
        const isAnswer = q.answer.value === o.id;
        const style = locked ? (isAnswer ? right : isChosen ? wrong : 'border-slate-200 opacity-70') : isChosen ? chosen : idle;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={isChosen} disabled={locked} onClick={() => onChange({ value: o.id })} className={`${base} ${style}`}>
            <ChoiceLabel c={o} />
            {locked && isAnswer && <Tick />}
          </button>
        );
      })}
    </div>
  );
}

function YesNoInput({ question: q, response, onChange, locked }: Props) {
  const value = response && 'value' in response ? response.value : null;
  const answer = 'value' in q.answer ? q.answer.value : null;
  const opts = [
    { id: 'yes', label: 'Yes', emoji: '👍' },
    { id: 'no', label: 'No', emoji: '👎' },
  ];
  return (
    <div className="grid grid-cols-2 gap-4" role="radiogroup">
      {opts.map((o) => {
        const isChosen = value === o.id;
        const style = locked ? (answer === o.id ? right : isChosen ? wrong : 'border-slate-200 opacity-70') : isChosen ? chosen : idle;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={isChosen} disabled={locked} onClick={() => onChange({ value: o.id })}
            className={`${base} ${style} flex-col justify-center py-6 text-2xl`}>
            <span className="text-5xl" aria-hidden>{o.emoji}</span>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function MultiInput({ question: q, response, onChange, locked }: Props<MultiQuestion>) {
  const values = response && 'values' in response ? response.values : [];
  const toggle = (id: string) => onChange({ values: values.includes(id) ? values.filter((v) => v !== id) : [...values, id] });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {q.options.map((o) => {
        const on = values.includes(o.id);
        const isAnswer = q.answer.values.includes(o.id);
        const style = locked ? (isAnswer ? right : on ? wrong : 'border-slate-200 opacity-70') : on ? chosen : idle;
        return (
          <button key={o.id} type="button" role="checkbox" aria-checked={on} disabled={locked} onClick={() => toggle(o.id)} className={`${base} ${style}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 ${on ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white'}`} aria-hidden>
              {on && <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3"><path d="M4 10l4 4 8-8" /></svg>}
            </span>
            <ChoiceLabel c={o} />
          </button>
        );
      })}
    </div>
  );
}

const PAIR_COLORS = ['bg-sky-500', 'bg-violet-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500', 'bg-cyan-600'];

function MatchInput({ question: q, response, onChange, locked }: Props<MatchQuestion>) {
  const pairs = response && 'pairs' in response ? response.pairs : {};
  const [active, setActive] = useState<string | null>(null);
  const rightOrder = useMemo(() => shuffleNotSorted(q.right, q.id), [q]);
  const colorOf = (leftId: string) => PAIR_COLORS[q.left.findIndex((l) => l.id === leftId) % PAIR_COLORS.length];
  const leftFor = (rightId: string) => Object.keys(pairs).find((l) => pairs[l] === rightId);

  const pair = (leftId: string, rightId: string) => {
    const next: Record<string, string> = {};
    for (const [l, r] of Object.entries(pairs)) if (l !== leftId && r !== rightId) next[l] = r;
    next[leftId] = rightId;
    onChange({ pairs: next });
    setActive(null);
  };
  const tapLeft = (id: string) => {
    if (locked) return;
    if (pairs[id] && active !== id) {
      const next = { ...pairs };
      delete next[id];
      onChange({ pairs: next });
    }
    setActive(active === id ? null : id);
  };
  const tapRight = (id: string) => {
    if (locked) return;
    if (active) pair(active, id);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6">
      <div className="space-y-3">
        {q.left.map((l) => {
          const paired = !!pairs[l.id];
          const ok = locked && pairs[l.id] === q.answer.pairs[l.id];
          return (
            <button key={l.id} type="button" disabled={locked} draggable={!locked}
              onDragStart={(e: DragEvent) => { e.dataTransfer.setData('text/plain', l.id); setActive(l.id); }}
              onClick={() => tapLeft(l.id)}
              aria-pressed={active === l.id}
              className={`${base} w-full ${active === l.id ? chosen : locked ? (ok ? right : wrong) : paired ? 'border-slate-300 bg-slate-50' : idle}`}>
              {paired && <span className={`h-4 w-4 shrink-0 rounded-full ${colorOf(l.id)}`} aria-hidden />}
              <ChoiceLabel c={l} />
            </button>
          );
        })}
      </div>
      <div className="space-y-3">
        {rightOrder.map((r) => {
          const l = leftFor(r.id);
          return (
            <button key={r.id} type="button" disabled={locked}
              onDragOver={(e: DragEvent) => e.preventDefault()}
              onDrop={(e: DragEvent) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id && !locked) pair(id, r.id); }}
              onClick={() => tapRight(r.id)}
              className={`${base} w-full ${active ? 'border-dashed border-brand-300 hover:bg-brand-50' : l ? 'border-slate-300 bg-slate-50' : idle}`}>
              {l && <span className={`h-4 w-4 shrink-0 rounded-full ${colorOf(l)}`} aria-hidden />}
              <ChoiceLabel c={r} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortInput({ question: q, response, onChange, locked }: Props<SortQuestion>) {
  const groups = response && 'groups' in response ? response.groups : {};
  const [active, setActive] = useState<string | null>(null);
  const items = useMemo(() => seededShuffle(q.items, q.id), [q]);
  const pool = items.filter((i) => !groups[i.id]);

  const place = (itemId: string, groupId: string) => {
    onChange({ groups: { ...groups, [itemId]: groupId } });
    setActive(null);
  };
  const unplace = (itemId: string) => {
    const next = { ...groups };
    delete next[itemId];
    onChange({ groups: next });
  };

  const Chip = ({ c, inGroup }: { c: Choice; inGroup?: string }) => {
    const ok = locked && inGroup && q.answer.groups[c.id] === inGroup;
    return (
      <button type="button" disabled={locked} draggable={!locked}
        onDragStart={(e: DragEvent) => { e.dataTransfer.setData('text/plain', c.id); setActive(c.id); }}
        onClick={() => (inGroup ? unplace(c.id) : setActive(active === c.id ? null : c.id))}
        aria-pressed={active === c.id}
        className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-base font-medium transition ${
          active === c.id ? chosen : locked ? (ok ? right : wrong) : 'border-slate-200 bg-white hover:border-brand-300'
        }`}>
        {c.emoji && <span className="text-2xl" aria-hidden>{c.emoji}</span>}
        {c.text}
      </button>
    );
  };

  return (
    <div className="space-y-4">
      <div className="min-h-[64px] rounded-2xl bg-slate-50 p-3">
        {pool.length ? (
          <div className="flex flex-wrap gap-2">{pool.map((c) => <Chip key={c.id} c={c} />)}</div>
        ) : (
          <p className="py-2 text-center text-slate-500">All cards are sorted. Tap a card to move it back.</p>
        )}
      </div>
      <div className={`grid gap-3 ${q.groups.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {q.groups.map((g) => (
          <div key={g.id}
            onDragOver={(e: DragEvent) => e.preventDefault()}
            onDrop={(e: DragEvent) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id && !locked) place(id, g.id); }}
            onClick={() => active && !locked && place(active, g.id)}
            role="group" aria-label={g.text}
            className={`min-h-[140px] rounded-2xl border-2 p-3 transition ${active ? 'cursor-pointer border-dashed border-brand-400 bg-brand-50/50' : 'border-slate-200 bg-white'}`}>
            <p className="mb-2 flex items-center gap-2 text-base font-semibold text-slate-700">
              {g.emoji && <span aria-hidden>{g.emoji}</span>}
              {g.text}
            </p>
            <div className="flex flex-wrap gap-2">
              {items.filter((i) => groups[i.id] === g.id).map((c) => <Chip key={c.id} c={c} inGroup={g.id} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SequenceInput({ question: q, response, onChange, locked }: Props<SequenceQuestion>) {
  const order = response && 'order' in response ? response.order : [];
  const shuffled = useMemo(() => shuffleNotSorted(q.items, q.id), [q]);
  const byId = (id: string) => q.items.find((i) => i.id === id)!;
  const pool = shuffled.filter((i) => !order.includes(i.id));
  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {q.items.map((_, i) => {
          const id = order[i];
          const ok = locked && id === q.answer.order[i];
          return (
            <li key={i} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">{i + 1}</span>
              {id ? (
                <button type="button" disabled={locked} onClick={() => onChange({ order: order.filter((x) => x !== id) })}
                  className={`${base} flex-1 py-3 ${locked ? (ok ? right : wrong) : 'border-brand-300 bg-brand-50'}`}>
                  <ChoiceLabel c={byId(id)} />
                </button>
              ) : (
                <div className="flex-1 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-3 text-slate-400">Tap a card below</div>
              )}
            </li>
          );
        })}
      </ol>
      {!locked && pool.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3">
          {pool.map((c) => (
            <button key={c.id} type="button" onClick={() => onChange({ order: [...order, c.id] })}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-base font-medium hover:border-brand-300">
              {c.emoji && <span className="text-2xl" aria-hidden>{c.emoji}</span>}
              {c.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FillInput({ question: q, response, onChange, locked }: Props<FillQuestion>) {
  const n = q.answer.blanks.length;
  const blanks = response && 'blanks' in response ? response.blanks : Array<string>(n).fill('');
  const bank = useMemo(() => seededShuffle(q.bank, q.id), [q]);
  const parts = q.text.split('___');

  const setWord = (word: string) => {
    const i = blanks.findIndex((b) => !b);
    if (i === -1) return;
    const next = blanks.slice();
    next[i] = word;
    onChange({ blanks: next });
  };
  const clear = (i: number) => {
    const next = blanks.slice();
    next[i] = '';
    onChange({ blanks: next });
  };

  return (
    <div className="space-y-5">
      <p className="rounded-2xl bg-slate-50 p-5 text-xl leading-[2.6rem] text-slate-800">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < n && (
              <button type="button" disabled={locked} onClick={() => clear(i)} aria-label={blanks[i] ? `Blank ${i + 1}: ${blanks[i]}. Tap to clear.` : `Blank ${i + 1}, empty`}
                className={`mx-1 inline-flex min-w-[6rem] justify-center rounded-xl border-2 px-3 py-0.5 align-middle font-semibold ${
                  locked
                    ? blanks[i].trim().toLowerCase() === q.answer.blanks[i].toLowerCase() ? right : wrong
                    : blanks[i] ? 'border-brand-400 bg-brand-50 text-brand-800' : 'border-dashed border-slate-300 bg-white text-slate-300'
                }`}>
                {blanks[i] || '?'}
              </button>
            )}
          </span>
        ))}
      </p>
      {!locked && (
        <div className="flex flex-wrap gap-2">
          {bank.map((w) => {
            const used = blanks.includes(w);
            return (
              <button key={w} type="button" disabled={used} onClick={() => setWord(w)}
                className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-lg font-medium text-slate-700 transition hover:border-brand-300 disabled:opacity-30">
                {w}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Tick() {
  return (
    <svg viewBox="0 0 24 24" className="ml-auto h-7 w-7 shrink-0 text-leaf-600" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="correct answer">
      <path d="M5 12l5 5 9-10" />
    </svg>
  );
}

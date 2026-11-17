'use client';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getBrowserClient } from '@/lib/supabase/client';
import { Card, EmptyState, btn } from '@/components/ui';

interface ClassRow { id: string; name: string }
interface StudentRow { id: string; student_code: string; full_name: string; class_id: string | null }
interface LoginCard { fullName: string; studentCode?: string; accessCode?: string; error?: string }

/** Lines like "Aisyah binti Ali" or "SQ-2A-001, Aisyah binti Ali". */
function parseLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = l.match(/^([A-Za-z0-9-]{3,20})\s*[,;\t]\s*(.+)$/);
      return m ? { studentCode: m[1], fullName: m[2] } : { fullName: l };
    });
}

export function ClassManager({ classes, students }: { classes: ClassRow[]; students: StudentRow[] }) {
  const router = useRouter();
  const supabase = getBrowserClient();
  const [newClass, setNewClass] = useState('');
  const [target, setTarget] = useState(classes[0]?.id ?? '');
  const [names, setNames] = useState('');
  const [cards, setCards] = useState<LoginCard[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const createClass = async (e: FormEvent) => {
    e.preventDefault();
    const name = newClass.trim();
    if (!name) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('classes').insert({ name, teacher_id: user!.id }).select('id').single();
    if (error) return setMsg(error.code === '23505' ? 'You already have a class with that name.' : error.message);
    setNewClass('');
    setTarget(data.id);
    setMsg(`Class “${name}” created.`);
    router.refresh();
  };

  const renameClass = async (c: ClassRow) => {
    const name = window.prompt('New class name', c.name)?.trim();
    if (!name || name === c.name) return;
    const { error } = await supabase.from('classes').update({ name }).eq('id', c.id);
    setMsg(error ? error.message : 'Class renamed.');
    router.refresh();
  };

  const deleteClass = async (c: ClassRow) => {
    if (students.some((s) => s.class_id === c.id)) return setMsg('Move or remove the pupils in this class first.');
    if (!window.confirm(`Delete class “${c.name}”?`)) return;
    const { error } = await supabase.from('classes').delete().eq('id', c.id);
    setMsg(error ? error.message : 'Class deleted.');
    router.refresh();
  };

  const addStudents = async (e: FormEvent) => {
    e.preventDefault();
    const list = parseLines(names);
    if (!target || !list.length) return setMsg('Choose a class and type at least one name.');
    setBusy(true);
    setMsg(null);
    const res = await fetch('/api/teacher/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classId: target, students: list }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg(json.error ?? 'Could not create accounts.');
    setCards(json.results);
    setNames('');
    const ok = (json.results as LoginCard[]).filter((r) => r.accessCode).length;
    setMsg(`${ok} account${ok === 1 ? '' : 's'} created. Print the login cards now — secret codes are only shown once.`);
    router.refresh();
  };

  const resetCode = async (s: StudentRow) => {
    if (!window.confirm(`Give ${s.full_name} a new secret code? The old code will stop working.`)) return;
    const res = await fetch(`/api/teacher/students/${s.id}`, { method: 'POST' });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return setMsg(json.error ?? 'Could not reset the code.');
    setCards([{ fullName: json.fullName, studentCode: json.studentCode, accessCode: json.accessCode }]);
    setMsg(`New secret code created for ${s.full_name}.`);
  };

  const removeStudent = async (s: StudentRow) => {
    if (!window.confirm(`Remove ${s.full_name}? Their account and ALL their progress will be deleted. This cannot be undone.`)) return;
    const res = await fetch(`/api/teacher/students/${s.id}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok ? `${s.full_name} was removed.` : (json.error ?? 'Could not remove pupil.'));
    router.refresh();
  };

  const moveStudent = async (s: StudentRow, classId: string) => {
    const { error } = await supabase.from('students').update({ class_id: classId }).eq('id', s.id);
    setMsg(error ? error.message : `${s.full_name} moved.`);
    router.refresh();
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="space-y-6">
      {msg && <p className="no-print rounded-2xl bg-brand-50 px-4 py-3 text-brand-900" role="status">{msg}</p>}

      {cards.length > 0 && (
        <Card>
          <div className="no-print mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Login cards</h2>
            <div className="flex gap-2">
              <button type="button" className={btn.smallPrimary} onClick={() => window.print()}>Print cards</button>
              <button type="button" className={btn.small} onClick={() => setCards([])}>Done</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <div key={i} className={`break-inside-avoid rounded-2xl border-2 border-dashed p-4 ${c.error ? 'border-amber-300 bg-amber-50' : 'border-slate-300'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Science Quest – Year 2</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{c.fullName}</p>
                {c.error ? (
                  <p className="mt-1 text-sm text-amber-900">Not created: {c.error}</p>
                ) : (
                  <>
                    <p className="mt-2 text-sm text-slate-500">Student ID</p>
                    <p className="font-mono text-xl font-bold tracking-wide">{c.studentCode}</p>
                    <p className="mt-1 text-sm text-slate-500">Secret code</p>
                    <p className="font-mono text-xl font-bold tracking-[0.25em]">{c.accessCode}</p>
                    <p className="mt-2 text-xs text-slate-400">{origin}/login</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="no-print grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Create a class</h2>
          <form onSubmit={createClass} className="mt-3 flex gap-2">
            <input value={newClass} onChange={(e) => setNewClass(e.target.value)} placeholder="e.g. 2 Arif" maxLength={60} aria-label="Class name"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-brand-400" />
            <button type="submit" className={btn.smallPrimary}>Create</button>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Add pupils</h2>
          {classes.length === 0 ? (
            <p className="mt-2 text-slate-500">Create a class first.</p>
          ) : (
            <form onSubmit={addStudents} className="mt-3 space-y-3">
              <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label="Class" className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <textarea value={names} onChange={(e) => setNames(e.target.value)} rows={5} aria-label="Pupil names"
                placeholder={'One pupil per line. Optionally add your own ID first:\nAisyah binti Ali\nSQ-2A-002, Kanang anak Jimbun'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm outline-none focus:border-brand-400" />
              <button type="submit" disabled={busy} className={btn.smallPrimary}>{busy ? 'Creating accounts…' : 'Create accounts'}</button>
            </form>
          )}
        </Card>
      </div>

      <div className="no-print space-y-4">
        {classes.length === 0 && <EmptyState title="No classes yet">Create your first class above.</EmptyState>}
        {classes.map((c) => {
          const list = students.filter((s) => s.class_id === c.id);
          return (
            <Card key={c.id} className="p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-900">{c.name} <span className="text-sm font-normal text-slate-500">· {list.length} pupils</span></h3>
                <div className="flex gap-2">
                  <button type="button" className={btn.small} onClick={() => renameClass(c)}>Rename</button>
                  <button type="button" className={btn.small} onClick={() => deleteClass(c)}>Delete</button>
                </div>
              </div>
              {list.length ? (
                <ul className="divide-y divide-slate-100">
                  {list.map((s) => (
                    <li key={s.id} className="flex flex-wrap items-center gap-3 px-6 py-3">
                      <span className="w-28 font-mono text-sm text-slate-600">{s.student_code}</span>
                      <span className="flex-1 font-medium text-slate-800">{s.full_name}</span>
                      {classes.length > 1 && (
                        <select value={s.class_id ?? ''} onChange={(e) => moveStudent(s, e.target.value)} aria-label={`Move ${s.full_name}`} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
                          {classes.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      )}
                      <button type="button" className={btn.small} onClick={() => resetCode(s)}>New secret code</button>
                      <button type="button" className={btn.small} onClick={() => removeStudent(s)}>Remove</button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-6 py-4 text-slate-500">No pupils yet.</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

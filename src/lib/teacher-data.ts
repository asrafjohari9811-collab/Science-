import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { fetchAll } from './supabase/server';
import type { ProgressRow, ScoreRow } from './progress';
import type { StudentRecord } from './report';

export interface ClassRow {
  id: string;
  name: string;
}

/**
 * Loads everything the teacher pages need. Row level security limits every query to
 * the signed-in teacher's own classes, so no extra filtering is needed for safety.
 */
export async function loadTeacherData(supabase: SupabaseClient, classId?: string | null) {
  const { data: classes, error: cErr } = await supabase.from('classes').select('id, name').order('name');
  if (cErr) throw new Error(cErr.message);
  const classList = (classes ?? []) as ClassRow[];
  const selected = classId && classList.some((c) => c.id === classId) ? classId : null;

  const rawStudents = await fetchAll<{ id: string; student_code: string; full_name: string; class_id: string | null }>((from, to) => {
    let q = supabase.from('students').select('id, student_code, full_name, class_id').order('full_name').range(from, to);
    if (selected) q = q.eq('class_id', selected);
    return q;
  });
  const className = new Map<string, string>(classList.map((c) => [c.id, c.name]));
  const students: StudentRecord[] = rawStudents.map((s) => ({ ...s, class_name: s.class_id ? (className.get(s.class_id) ?? null) : null }));
  const ids = students.map((s) => s.id);

  const progress: ProgressRow[] = [];
  const scores: ScoreRow[] = [];
  // Chunk the id list to keep URLs short.
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    progress.push(...(await fetchAll<ProgressRow>((from, to) => supabase.from('student_progress').select('*').in('student_id', chunk).range(from, to))));
    scores.push(...(await fetchAll<ScoreRow>((from, to) => supabase.from('scores').select('*').in('student_id', chunk).range(from, to))));
  }

  return { classes: classList, selectedClassId: selected, students, progress, scores };
}

// Builds the teacher tables, charts and exports from real database rows (no sample data).
import { ACTIVITIES, LEVEL_LABEL, UNITS, getActivity, getUnit } from './content';
import {
  STATUS_LABEL, averageScore, indexProgress, lastActive, num, overallPct, unitSummary,
  type ProgressRow, type ScoreRow, type Status,
} from './progress';

export interface StudentRecord {
  id: string;
  student_code: string;
  full_name: string;
  class_id: string | null;
  class_name: string | null;
}

export interface StudentSummary {
  student: StudentRecord;
  units: { unitId: number; status: Status; pct: number }[];
  overall: number;
  avgScore: number | null;
  lastActive: string | null;
  completedActivities: number;
  inProgressActivities: number;
  stars: number;
}

export function groupBy<T>(rows: T[], key: (r: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const r of rows) {
    const k = key(r);
    const list = m.get(k);
    if (list) list.push(r);
    else m.set(k, [r]);
  }
  return m;
}

export function summarise(students: StudentRecord[], progress: ProgressRow[], scores: ScoreRow[]): StudentSummary[] {
  const pBy = groupBy(progress, (r) => r.student_id);
  const sBy = groupBy(scores, (r) => r.student_id);
  return students.map((student) => {
    const rows = pBy.get(student.id) ?? [];
    const by = indexProgress(rows);
    const best = new Map<string, number>();
    for (const s of sBy.get(student.id) ?? []) best.set(s.activity_id, Math.max(best.get(s.activity_id) ?? 0, s.stars));
    return {
      student,
      units: UNITS.map((u) => {
        const s = unitSummary(u, by);
        return { unitId: u.id, status: s.status, pct: s.pct };
      }),
      overall: overallPct(by),
      avgScore: averageScore(rows),
      lastActive: lastActive(rows),
      completedActivities: rows.filter((r) => r.status === 'completed').length,
      inProgressActivities: rows.filter((r) => r.status === 'in_progress').length,
      stars: [...best.values()].reduce((a, b) => a + b, 0),
    };
  });
}

export function classOverview(summaries: StudentSummary[], progress: ProgressRow[]) {
  const n = summaries.length;
  const completed = progress.filter((r) => r.status === 'completed').length;
  const inProgress = progress.filter((r) => r.status === 'in_progress').length;
  const notStarted = summaries.filter((s) => !s.lastActive).length;
  const scored = summaries.map((s) => s.avgScore).filter((v): v is number => v !== null);
  return {
    totalStudents: n,
    completedActivities: completed,
    inProgressActivities: inProgress,
    notStartedStudents: notStarted,
    averageScore: scored.length ? Math.round(scored.reduce((a, b) => a + b, 0) / scored.length) : null,
    completionPct: n ? Math.round(summaries.reduce((a, s) => a + s.overall, 0) / n) : 0,
  };
}

/** Per-unit completion rate (% of activity slots completed) and average best score. */
export function unitStats(studentCount: number, progress: ProgressRow[]) {
  return UNITS.map((u) => {
    const rows = progress.filter((r) => r.unit_id === u.id);
    const done = rows.filter((r) => r.status === 'completed');
    const slots = studentCount * u.activities.length;
    return {
      unitId: u.id,
      name: `U${u.id}`,
      title: u.title,
      completion: slots ? Math.round((done.length / slots) * 100) : 0,
      avgScore: done.length ? Math.round(done.reduce((a, r) => a + num(r.best_percentage), 0) / done.length) : null,
      attempted: new Set(rows.map((r) => r.student_id)).size,
    };
  });
}

export function notAttempted(students: StudentRecord[], progress: ProgressRow[], activityId: string): StudentRecord[] {
  const started = new Set(progress.filter((r) => r.activity_id === activityId && r.total_attempts > 0).map((r) => r.student_id));
  return students.filter((s) => !started.has(s.id));
}

export function lastSavedPosition(rows: ProgressRow[]): string {
  const latest = [...rows].filter((r) => r.last_activity_at).sort((a, b) => (b.last_activity_at ?? '').localeCompare(a.last_activity_at ?? ''))[0];
  if (!latest) return 'No activity yet';
  const act = getActivity(latest.activity_id);
  const unit = act && getUnit(act.unitId);
  if (!act || !unit) return latest.activity_id;
  const total = act.questions.length;
  const where = latest.questions_completed >= total ? 'finished' : `saved after question ${latest.questions_completed} of ${total}`;
  return `Unit ${unit.id} · ${act.title} (${LEVEL_LABEL[act.level]}) — ${where}`;
}

// ---------------------------------------------------------------------------
// Export rows
// ---------------------------------------------------------------------------
export function summaryRows(summaries: StudentSummary[]) {
  return summaries.map((s) => {
    const row: Record<string, string | number> = {
      'Student ID': s.student.student_code,
      'Student Name': s.student.full_name,
      Class: s.student.class_name ?? '',
    };
    for (const u of s.units) row[`Unit ${u.unitId}`] = `${STATUS_LABEL[u.status]} (${u.pct}%)`;
    row['Overall Progress (%)'] = s.overall;
    row['Average Score (%)'] = s.avgScore ?? '';
    row['Activities Completed'] = s.completedActivities;
    row['Stars'] = s.stars;
    row['Last Active'] = s.lastActive ? new Date(s.lastActive).toLocaleString('en-MY') : '';
    return row;
  });
}

/** One row per student per activity, with every field the brief asks to store. */
export function detailRows(students: StudentRecord[], progress: ProgressRow[]) {
  const by = new Map(progress.map((r) => [`${r.student_id}:${r.activity_id}`, r]));
  const rows: Record<string, string | number>[] = [];
  for (const s of students) {
    for (const a of ACTIVITIES) {
      const r = by.get(`${s.id}:${a.id}`);
      rows.push({
        'Student ID': s.student_code,
        'Student Name': s.full_name,
        Class: s.class_name ?? '',
        'Unit Number': a.unitId,
        'Unit Title': getUnit(a.unitId)!.title,
        'Activity Name': a.title,
        'Activity Level': LEVEL_LABEL[a.level],
        'Activity Status': STATUS_LABEL[r?.status ?? 'not_started'],
        'Questions Attempted': r?.questions_attempted ?? 0,
        'Questions Completed': r?.questions_completed ?? 0,
        'Total Questions': a.questions.length,
        'Correct Answers': r?.correct_answers ?? 0,
        'Incorrect Answers': r?.incorrect_answers ?? 0,
        'Total Score': r?.total_score ?? 0,
        'Best Score': r?.best_score ?? 0,
        'Completion (%)': r ? num(r.completion_pct) : 0,
        'Last Saved Question': r?.last_question_index != null ? r.last_question_index + 1 : '',
        'Total Attempts': r?.total_attempts ?? 0,
        'Last Activity': r?.last_activity_at ? new Date(r.last_activity_at).toLocaleString('en-MY') : '',
      });
    }
  }
  return rows;
}

export function toCsv(rows: Record<string, string | number>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\r\n');
}

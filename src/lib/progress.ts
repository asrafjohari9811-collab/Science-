// Pure helpers for turning saved progress rows into what the dashboards show.
import { ACTIVITIES, UNITS, getActivity, type Unit } from './content';

export type Status = 'not_started' | 'in_progress' | 'completed';

/** Mirrors the student_progress table. */
export interface ProgressRow {
  student_id: string;
  activity_id: string;
  unit_id: number;
  level: number;
  status: Status;
  current_attempt_id: string | null;
  last_question_index: number | null;
  questions_attempted: number;
  questions_completed: number;
  correct_answers: number;
  incorrect_answers: number;
  total_score: number;
  best_score: number;
  best_percentage: number | string;
  completion_pct: number | string;
  total_attempts: number;
  last_activity_at: string | null;
}

export interface ScoreRow {
  student_id: string;
  activity_id: string;
  attempt_id: string;
  score: number;
  max_score: number;
  percentage: number | string;
  stars: number;
  completed_at: string;
}

export const STATUS_LABEL: Record<Status, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const num = (v: number | string | null | undefined) => (v == null ? 0 : typeof v === 'number' ? v : parseFloat(v) || 0);

/** Same rule as sq_stars() in SQL: 80%+ = 3 stars, 50%+ = 2 stars, otherwise 1. */
export function starsFor(score: number, max: number): 1 | 2 | 3 {
  if (max <= 0) return 1;
  if (score * 100 >= max * 80) return 3;
  if (score * 100 >= max * 50) return 2;
  return 1;
}

export function indexProgress(rows: ProgressRow[]): Map<string, ProgressRow> {
  return new Map(rows.map((r) => [r.activity_id, r]));
}

export function activityPct(row: ProgressRow | undefined): number {
  return row ? Math.min(100, num(row.completion_pct)) : 0;
}

export function unitSummary(unit: Unit, byActivity: Map<string, ProgressRow>) {
  const rows = unit.activities.map((a) => byActivity.get(a.id));
  const pct = Math.round(rows.reduce((s, r) => s + activityPct(r), 0) / unit.activities.length);
  const completed = rows.filter((r) => r?.status === 'completed').length;
  const started = rows.some((r) => r && r.status !== 'not_started');
  const status: Status = completed === unit.activities.length ? 'completed' : started ? 'in_progress' : 'not_started';
  const scored = rows.filter((r): r is ProgressRow => !!r && r.status === 'completed');
  const avgScore = scored.length ? Math.round(scored.reduce((s, r) => s + num(r.best_percentage), 0) / scored.length) : null;
  return { pct, status, completed, total: unit.activities.length, avgScore };
}

export function overallPct(byActivity: Map<string, ProgressRow>): number {
  return Math.round(ACTIVITIES.reduce((s, a) => s + activityPct(byActivity.get(a.id)), 0) / ACTIVITIES.length);
}

export function averageScore(rows: ProgressRow[]): number | null {
  const done = rows.filter((r) => r.status === 'completed');
  return done.length ? Math.round(done.reduce((s, r) => s + num(r.best_percentage), 0) / done.length) : null;
}

export function totalStars(scores: ScoreRow[]): number {
  // Best stars per activity, so repeating an activity can raise but never double count stars.
  const best = new Map<string, number>();
  for (const s of scores) best.set(s.activity_id, Math.max(best.get(s.activity_id) ?? 0, s.stars));
  return [...best.values()].reduce((a, b) => a + b, 0);
}

export function lastActive(rows: ProgressRow[]): string | null {
  let latest: string | null = null;
  for (const r of rows) if (r.last_activity_at && (!latest || r.last_activity_at > latest)) latest = r.last_activity_at;
  return latest;
}

/** The unfinished activity the pupil touched most recently. */
export function latestUnfinished(rows: ProgressRow[]): ProgressRow | null {
  const open = rows
    .filter((r) => r.current_attempt_id && r.questions_completed > 0 && r.questions_completed < (getActivity(r.activity_id)?.questions.length ?? 0))
    .sort((a, b) => (b.last_activity_at ?? '').localeCompare(a.last_activity_at ?? ''));
  return open[0] ?? null;
}

/** Suggest what to do next: the first activity (in unit order) that is not completed. */
export function nextSuggested(byActivity: Map<string, ProgressRow>) {
  return ACTIVITIES.find((a) => byActivity.get(a.id)?.status !== 'completed') ?? null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
}

/** Badges are worked out from real saved progress (nothing is stored separately). */
export function earnedBadges(rows: ProgressRow[], scores: ScoreRow[]): Badge[] {
  const by = indexProgress(rows);
  const badges: Badge[] = [];
  if (scores.length > 0) badges.push({ id: 'first', emoji: '🚀', title: 'First Step', description: 'Finished your first activity.' });
  if (scores.some((s) => s.score === s.max_score)) badges.push({ id: 'perfect', emoji: '🎯', title: 'Perfect Score', description: 'Got every answer right in an activity.' });
  if (rows.some((r) => r.level === 3 && r.status === 'completed')) badges.push({ id: 'challenge', emoji: '🧠', title: 'Challenge Taker', description: 'Finished a Level 3 Challenge.' });
  for (const u of UNITS) {
    if (unitSummary(u, by).status === 'completed') badges.push({ id: `unit-${u.id}`, emoji: '🏅', title: `${u.title} Explorer`, description: `Completed Unit ${u.id}.` });
  }
  if (UNITS.every((u) => unitSummary(u, by).status === 'completed'))
    badges.push({ id: 'all', emoji: '🔬', title: 'Science Explorer', description: 'Completed all 10 units!' });
  return badges;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-MY', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function relativeTime(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return 'Never';
  const mins = Math.round((now - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return days === 1 ? 'Yesterday' : `${days} days ago`;
}

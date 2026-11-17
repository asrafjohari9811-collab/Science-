'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, EmptyState } from '@/components/ui';

interface UnitStat { unitId: number; name: string; title: string; completion: number; avgScore: number | null; attempted: number }
interface StudentBar { name: string; overall: number }

const BAR = '#3b92f6'; // brand-500, single series
const GRID = '#eef2f7';
const AXIS = { fontSize: 12, fill: '#64748b' };

function ChartTooltip({ active, payload, label, suffix, titles }: { active?: boolean; payload?: { value: number | null }[]; label?: string; suffix: string; titles?: Record<string, string> }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-card">
      <p className="font-semibold text-slate-800">{titles?.[label ?? ''] ?? label}</p>
      <p className="text-slate-600">{v == null ? 'No scores yet' : `${v}${suffix}`}</p>
    </div>
  );
}

function UnitBarChart({ data, dataKey, suffix }: { data: UnitStat[]; dataKey: 'completion' | 'avgScore'; suffix: string }) {
  const titles = Object.fromEntries(data.map((d) => [d.name, `Unit ${d.unitId}: ${d.title}`]));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS} tickLine={false} axisLine={false} unit="%" />
          <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltip suffix={suffix} titles={titles} />} />
          <Bar dataKey={dataKey} fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ClassCharts({ units, students }: { units: UnitStat[]; students: StudentBar[] }) {
  const challenging = units
    .filter((u) => u.avgScore !== null)
    .sort((a, b) => (a.avgScore ?? 0) - (b.avgScore ?? 0))
    .slice(0, 3);
  const anyData = units.some((u) => u.attempted > 0);

  if (!anyData) {
    return <EmptyState title="No activity yet">Charts appear here as soon as your pupils complete their first questions.</EmptyState>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Completion rate by unit</h3>
        <p className="mb-3 text-sm text-slate-500">Share of all activities in the unit completed by the class</p>
        <UnitBarChart data={units} dataKey="completion" suffix="% completed" />
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Average score by unit</h3>
        <p className="mb-3 text-sm text-slate-500">Average best score on completed activities</p>
        <UnitBarChart data={units} dataKey="avgScore" suffix="% average score" />
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Student performance comparison</h3>
        <p className="mb-3 text-sm text-slate-500">Overall progress across all 10 units</p>
        <div style={{ height: Math.max(180, students.length * 28 + 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={students} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }} barCategoryGap="24%">
              <CartesianGrid horizontal={false} stroke={GRID} />
              <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={AXIS} tickLine={false} axisLine={false} unit="%" />
              <YAxis type="category" dataKey="name" width={110} tick={AXIS} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltip suffix="% overall progress" />} />
              <Bar dataKey="overall" fill={BAR} radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Most challenging units</h3>
        <p className="mb-3 text-sm text-slate-500">Lowest average scores — good topics to revisit in class</p>
        {challenging.length ? (
          <ol className="space-y-3">
            {challenging.map((u, i) => (
              <li key={u.unitId} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white font-bold text-slate-700">{i + 1}</span>
                <span className="flex-1 font-medium text-slate-800">Unit {u.unitId}: {u.title}</span>
                <span className="font-semibold text-slate-700">{u.avgScore}%</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-slate-500">Shown once pupils complete activities.</p>
        )}
        <table className="mt-5 w-full text-left text-sm">
          <caption className="sr-only">Unit completion and scores</caption>
          <thead className="text-slate-500"><tr><th className="py-1">Unit</th><th>Completed</th><th>Avg score</th><th>Pupils started</th></tr></thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {units.map((u) => (
              <tr key={u.unitId}><td className="py-1.5">{u.unitId}. {u.title}</td><td>{u.completion}%</td><td>{u.avgScore ?? '—'}{u.avgScore != null && '%'}</td><td>{u.attempted}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

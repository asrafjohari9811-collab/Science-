// Generates supabase/seed/content.sql from the TypeScript content in src/lib/content.
// Run: npm run content:sql
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { UNITS, ACTIVITIES, TOTAL_QUESTIONS } from '../src/lib/content';
import { validateContent } from '../src/lib/content/validate';

const problems = validateContent();
if (problems.length) {
  console.error('Content problems:\n' + problems.join('\n'));
  process.exit(1);
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;

const lines: string[] = [];
lines.push('-- GENERATED FILE. Do not edit by hand. Run `npm run content:sql` after changing src/lib/content.');
lines.push(`-- ${UNITS.length} units, ${ACTIVITIES.length} activities, ${TOTAL_QUESTIONS} questions`);
lines.push('begin;');
lines.push('set local search_path = public;');

for (const u of UNITS) {
  lines.push(
    `insert into units (id, slug, title, theme, sort_order) values (${u.id}, ${q(u.slug)}, ${q(u.title)}, ${q(u.theme)}, ${u.id})` +
      ` on conflict (id) do update set slug = excluded.slug, title = excluded.title, theme = excluded.theme, sort_order = excluded.sort_order;`,
  );
}

ACTIVITIES.forEach((a, i) => {
  lines.push(
    `insert into activities (id, unit_id, level, title, question_count, standards, sort_order) values (${q(a.id)}, ${a.unitId}, ${a.level}, ${q(a.title)}, ${a.questions.length}, ${q('{' + a.standards.join(',') + '}')}::text[], ${i + 1})` +
      ` on conflict (id) do update set unit_id = excluded.unit_id, level = excluded.level, title = excluded.title, question_count = excluded.question_count, standards = excluded.standards, sort_order = excluded.sort_order;`,
  );
  for (const question of a.questions) {
    const { id, position, type, prompt, answer, explanation, ...data } = question;
    lines.push(
      `insert into questions (id, activity_id, position, type, prompt, data) values (${q(id)}, ${q(a.id)}, ${position}, ${q(type)}, ${q(prompt)}, ${j(data)})` +
        ` on conflict (id) do update set activity_id = excluded.activity_id, position = excluded.position, type = excluded.type, prompt = excluded.prompt, data = excluded.data;`,
    );
    lines.push(
      `insert into question_keys (question_id, answer, explanation) values (${q(id)}, ${j(answer)}, ${q(explanation)})` +
        ` on conflict (question_id) do update set answer = excluded.answer, explanation = excluded.explanation;`,
    );
  }
});

// Remove questions that no longer exist in the content (only if never answered).
const ids = ACTIVITIES.flatMap((a) => a.questions.map((x) => q(x.id))).join(',');
lines.push(`delete from questions where id not in (${ids}) and not exists (select 1 from attempt_answers aa where aa.question_id = questions.id);`);
lines.push('commit;');

const out = join(__dirname, '..', 'supabase', 'seed', 'content.sql');
writeFileSync(out, lines.join('\n') + '\n');
console.log(`Wrote ${out}: ${UNITS.length} units, ${ACTIVITIES.length} activities, ${TOTAL_QUESTIONS} questions.`);

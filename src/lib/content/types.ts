// Content model for Science Quest Year 2.
// Content is authored in TypeScript (src/lib/content/units/*.ts), bundled with the app
// (so activities keep working offline) and exported to SQL (supabase/seed/content.sql)
// so the database can grade answers and teachers can see question text in reports.

export type QuestionType = 'mcq' | 'yesno' | 'multi' | 'match' | 'sort' | 'sequence' | 'fill';

export type Level = 1 | 2 | 3 | 4; // 4 = Unit Assessment

export interface Choice {
  id: string;
  text: string;
  emoji?: string;
}

/** Optional picture shown with a question. */
export type Visual =
  | { kind: 'emoji'; value: string; caption?: string }
  | { kind: 'circuit'; cell: boolean; bulb: boolean; switchClosed: boolean | null; gap?: boolean; bulbOn?: boolean; caption?: string };

/** Canonical answer / response shapes (also used by the SQL grader). */
export type Response =
  | { value: string } // mcq, yesno
  | { values: string[] } // multi (order-insensitive)
  | { pairs: Record<string, string> } // match: left id -> right id
  | { groups: Record<string, string> } // sort: item id -> group id
  | { order: string[] } // sequence
  | { blanks: string[] }; // fill

interface QuestionBase {
  id: string;
  position: number; // 1-based within activity
  type: QuestionType;
  prompt: string;
  visual?: Visual;
  answer: Response;
  explanation: string; // shown after every answer, kind wording
}

export interface McqQuestion extends QuestionBase { type: 'mcq'; options: Choice[]; answer: { value: string } }
export interface YesNoQuestion extends QuestionBase { type: 'yesno'; answer: { value: 'yes' | 'no' } }
export interface MultiQuestion extends QuestionBase { type: 'multi'; options: Choice[]; answer: { values: string[] } }
export interface MatchQuestion extends QuestionBase { type: 'match'; left: Choice[]; right: Choice[]; answer: { pairs: Record<string, string> } }
export interface SortQuestion extends QuestionBase { type: 'sort'; groups: Choice[]; items: Choice[]; answer: { groups: Record<string, string> } }
export interface SequenceQuestion extends QuestionBase { type: 'sequence'; items: Choice[]; answer: { order: string[] } }
export interface FillQuestion extends QuestionBase { type: 'fill'; text: string; bank: string[]; answer: { blanks: string[] } }

export type Question =
  | McqQuestion | YesNoQuestion | MultiQuestion | MatchQuestion | SortQuestion | SequenceQuestion | FillQuestion;

export interface Activity {
  id: string; // e.g. "u04-l2"
  unitId: number;
  level: Level;
  title: string;
  skill: string; // short description of the thinking skill
  instructions: string;
  standards: string[]; // DSKP learning standards this activity supports (verified against DSKP 2017)
  questions: Question[];
}

export interface Unit {
  id: number;
  slug: string;
  title: string;
  theme: string; // DSKP theme
  intro: string;
  objectives: string[];
  notes: { heading: string; body: string; emoji?: string }[];
  standards: string[];
  activities: Activity[];
}

export const LEVEL_LABEL: Record<Level, string> = {
  1: 'Level 1 · Foundation',
  2: 'Level 2 · Developing',
  3: 'Level 3 · Challenge',
  4: 'Unit Assessment',
};

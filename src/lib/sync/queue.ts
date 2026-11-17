// Offline-first save queue.
//
// Every answer is written to this device first (so nothing is lost if the tab closes or the
// network drops), then sent to Supabase in order. The server functions are idempotent
// (client_event_id), refuse out-of-order answers and never overwrite a saved answer, so
// retries and a second device cannot corrupt progress.
//
// This file has no browser or Supabase imports so it can be unit tested in Node.

import type { Response } from '../content/types';

export interface SavedAnswer {
  question_index: number;
  question_id: string;
  response: Response;
  is_correct: boolean;
  answered_at?: string;
}

export interface AttemptState {
  attempt_id: string;
  activity_id: string;
  attempt_no: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  current_index: number;
  total_questions: number;
  correct_count: number;
  incorrect_count: number;
  answers: SavedAnswer[];
  updated_at?: string;
  completed_at?: string | null;
}

export type QueueOp =
  | { kind: 'start'; eventId: string; activityId: string; attemptId: string; restart: boolean; createdAt: string }
  | {
      kind: 'answer';
      eventId: string;
      activityId: string;
      attemptId: string;
      questionIndex: number;
      questionId: string;
      response: Response;
      answeredAt: string;
    };

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type ServerResult = { status: string; is_correct?: boolean; completed?: boolean; state?: AttemptState };

/** What the sync engine needs from the server (implemented with supabase.rpc in the app). */
export interface Transport {
  startAttempt(activityId: string, clientAttemptId: string | null, restart: boolean): Promise<ServerResult>;
  submitAnswer(attemptId: string, index: number, response: Response, eventId: string, answeredAt: string): Promise<ServerResult>;
}

/** Thrown by a Transport when the request never reached the server (offline, timeout). */
export class NetworkError extends Error {
  constructor(message = 'Network unavailable') {
    super(message);
    this.name = 'NetworkError';
  }
}

/** Thrown by a Transport when the session expired; the queue is kept until the pupil signs in again. */
export class AuthError extends Error {
  constructor(message = 'Not signed in') {
    super(message);
    this.name = 'AuthError';
  }
}

export function newId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (c?.randomUUID) return c.randomUUID();
  // RFC 4122 v4 fallback for very old browsers.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    return (ch === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export class LocalStore {
  constructor(private readonly studentId: string, private readonly kv: KV) {}

  private key(name: string) {
    return `sq:v1:${this.studentId}:${name}`;
  }

  private read<T>(name: string, fallback: T): T {
    try {
      const raw = this.kv.getItem(this.key(name));
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private write(name: string, value: unknown) {
    try {
      this.kv.setItem(this.key(name), JSON.stringify(value));
    } catch {
      /* storage full or blocked: the server copy is still the source of truth */
    }
  }

  queue(): QueueOp[] {
    return this.read<QueueOp[]>('queue', []);
  }

  enqueue(op: QueueOp) {
    const q = this.queue();
    if (!q.some((o) => o.eventId === op.eventId)) q.push(op);
    this.write('queue', q);
  }

  dequeue(eventId: string) {
    this.write('queue', this.queue().filter((o) => o.eventId !== eventId));
  }

  dropAttempt(attemptId: string) {
    this.write('queue', this.queue().filter((o) => o.attemptId !== attemptId));
  }

  attempt(activityId: string): AttemptState | null {
    return this.read<AttemptState | null>(`attempt:${activityId}`, null);
  }

  saveAttempt(state: AttemptState) {
    this.write(`attempt:${state.activity_id}`, state);
  }

  clearAttempt(activityId: string) {
    this.kv.removeItem(this.key(`attempt:${activityId}`));
  }

  snapshot<T>(name: string): T | null {
    return this.read<T | null>(`snapshot:${name}`, null);
  }

  saveSnapshot(name: string, value: unknown) {
    this.write(`snapshot:${name}`, value);
  }
}

/**
 * Decide which copy of an attempt to show when an activity opens.
 * Unsent answers on this device win (they are newer); otherwise the server copy wins.
 */
export function chooseState(local: AttemptState | null, server: AttemptState | null, queue: QueueOp[]): AttemptState | null {
  if (local && queue.some((o) => o.attemptId === local.attempt_id)) return local;
  return server ?? local;
}

/** Record an answer locally (optimistic update). */
export function applyLocalAnswer(state: AttemptState, answer: SavedAnswer): AttemptState {
  if (state.status !== 'in_progress' || answer.question_index !== state.current_index) return state;
  const next = state.current_index + 1;
  const done = next >= state.total_questions;
  return {
    ...state,
    current_index: next,
    correct_count: state.correct_count + (answer.is_correct ? 1 : 0),
    incorrect_count: state.incorrect_count + (answer.is_correct ? 0 : 1),
    answers: [...state.answers.filter((a) => a.question_index !== answer.question_index), answer],
    status: done ? 'completed' : 'in_progress',
    completed_at: done ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

export function emptyAttempt(activityId: string, attemptId: string, total: number, attemptNo = 1): AttemptState {
  return {
    attempt_id: attemptId,
    activity_id: activityId,
    attempt_no: attemptNo,
    status: 'in_progress',
    current_index: 0,
    total_questions: total,
    correct_count: 0,
    incorrect_count: 0,
    answers: [],
    updated_at: new Date().toISOString(),
  };
}

export type FlushOutcome = {
  sent: number;
  remaining: number;
  offline: boolean;
  authRequired: boolean;
  /** Activities whose saved state on the server differs from this device (e.g. answered elsewhere). */
  conflicts: string[];
  /** Latest server state for each activity touched during the flush. */
  states: Record<string, AttemptState>;
};

/**
 * Send queued operations in order. Stops at the first network/auth failure and keeps the rest.
 * Operations the server will never accept (already answered elsewhere, closed attempt) are dropped
 * and reported as conflicts so the screen can reload the saved state.
 */
export async function flushQueue(store: LocalStore, transport: Transport): Promise<FlushOutcome> {
  const out: FlushOutcome = { sent: 0, remaining: 0, offline: false, authRequired: false, conflicts: [], states: {} };
  for (const op of store.queue()) {
    let res: ServerResult;
    try {
      res =
        op.kind === 'start'
          ? await transport.startAttempt(op.activityId, op.attemptId, op.restart)
          : await transport.submitAnswer(op.attemptId, op.questionIndex, op.response, op.eventId, op.answeredAt);
    } catch (e) {
      if (e instanceof NetworkError) out.offline = true;
      else if (e instanceof AuthError) out.authRequired = true;
      else {
        // The server rejected this operation outright (bad data). Drop it so it cannot block the queue.
        store.dequeue(op.eventId);
        if (!out.conflicts.includes(op.activityId)) out.conflicts.push(op.activityId);
        continue;
      }
      break;
    }
    store.dequeue(op.eventId);
    out.sent++;
    if (res.state) out.states[op.activityId] = res.state;
    const accepted = op.kind === 'start' || res.status === 'ok' || res.status === 'duplicate';
    if (!accepted) {
      // already_answered | out_of_order | closed | not_found: the server copy wins.
      store.dropAttempt(op.attemptId);
      if (!out.conflicts.includes(op.activityId)) out.conflicts.push(op.activityId);
    }
  }
  out.remaining = store.queue().length;
  return out;
}

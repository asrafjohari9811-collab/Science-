// Simulates TEST 1–3 and TEST 5 against an in-memory fake of the Supabase functions,
// including going offline mid-activity and a second device.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LocalStore, NetworkError, applyLocalAnswer, chooseState, emptyAttempt, flushQueue, newId,
  type AttemptState, type KV, type ServerResult, type Transport,
} from '../../src/lib/sync/queue';
import { getActivity } from '../../src/lib/content';
import { grade } from '../../src/lib/grading';
import type { Response } from '../../src/lib/content/types';

class MemKV implements KV {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

/** In-memory model of start_attempt / submit_answer with the same rules as the SQL. */
class FakeServer {
  attempts = new Map<string, AttemptState>();
  events = new Map<string, boolean>();
  online = true;
  transport(): Transport {
    return {
      startAttempt: async (activityId, clientId, restart) => this.call(() => this.start(activityId, clientId, restart)),
      submitAnswer: async (attemptId, index, response, eventId) => this.call(() => this.submit(attemptId, index, response, eventId)),
    };
  }
  private call(fn: () => ServerResult) {
    if (!this.online) throw new NetworkError();
    return structuredClone(fn());
  }
  start(activityId: string, clientId: string | null, restart: boolean): ServerResult {
    if (clientId && this.attempts.has(clientId)) return { status: 'existing', state: this.attempts.get(clientId) };
    const open = [...this.attempts.values()].find((a) => a.activity_id === activityId && a.status === 'in_progress');
    if (open && !restart && !clientId) return { status: 'resumed', state: open };
    if (open) open.status = 'abandoned';
    const total = getActivity(activityId)!.questions.length;
    const s = emptyAttempt(activityId, clientId ?? newId(), total, this.attempts.size + 1);
    this.attempts.set(s.attempt_id, s);
    return { status: 'started', state: s };
  }
  submit(attemptId: string, index: number, response: Response, eventId: string): ServerResult {
    const a = this.attempts.get(attemptId);
    if (!a) return { status: 'not_found' };
    if (this.events.has(eventId)) return { status: 'duplicate', state: a };
    if (a.status !== 'in_progress') return { status: 'closed', state: a };
    if (index < a.current_index) return { status: 'already_answered', state: a };
    if (index > a.current_index) return { status: 'out_of_order', state: a };
    const q = getActivity(a.activity_id)!.questions[index];
    const ok = grade(q, response);
    this.events.set(eventId, ok);
    const next = applyLocalAnswer(a, { question_index: index, question_id: q.id, response, is_correct: ok });
    this.attempts.set(attemptId, next);
    return { status: 'ok', is_correct: ok, state: next };
  }
}

/** A device: its own storage, answering like the app does (save locally, queue, then flush). */
class Device {
  store: LocalStore;
  constructor(public server: FakeServer, kv = new MemKV()) { this.store = new LocalStore('student-1', kv); }
  async open(activityId: string): Promise<AttemptState> {
    let server: AttemptState | null = null;
    try {
      await flushQueue(this.store, this.server.transport());
      server = (await this.server.transport().startAttempt(activityId, null, false)).state ?? null;
    } catch { /* offline */ }
    let state = chooseState(this.store.attempt(activityId), server, this.store.queue());
    if (!state) {
      state = emptyAttempt(activityId, newId(), getActivity(activityId)!.questions.length);
      this.store.enqueue({ kind: 'start', eventId: newId(), activityId, attemptId: state.attempt_id, restart: false, createdAt: new Date().toISOString() });
    }
    this.store.saveAttempt(state);
    return state;
  }
  async answer(activityId: string, correct: boolean) {
    const state = this.store.attempt(activityId)!;
    const q = getActivity(activityId)!.questions[state.current_index];
    const response = correct ? q.answer : ({ value: 'zzz' } as Response);
    const ok = grade(q, response);
    this.store.saveAttempt(applyLocalAnswer(state, { question_index: state.current_index, question_id: q.id, response, is_correct: ok }));
    this.store.enqueue({ kind: 'answer', eventId: newId(), activityId, attemptId: state.attempt_id, questionIndex: state.current_index, questionId: q.id, response, answeredAt: new Date().toISOString() });
    const r = await flushQueue(this.store, this.server.transport());
    const s = r.states[activityId];
    if (s && !this.store.queue().length) this.store.saveAttempt(s);
    return r;
  }
}

const ACT = 'u03-l1';

test('TEST 1-3: answer 5, close the app, come back at question 6 with score kept', async () => {
  const server = new FakeServer();
  const kv = new MemKV();
  const d = new Device(server, kv);
  await d.open(ACT);
  for (let i = 0; i < 5; i++) await d.answer(ACT, i !== 1);
  // "close the app": a brand-new Device object on the same storage
  const again = await new Device(server, kv).open(ACT);
  assert.equal(again.current_index, 5);
  assert.equal(again.correct_count, 4);
  assert.equal(again.answers.length, 5);
  assert.equal(new Device(server, kv).store.queue().length, 0, 'everything synced');
});

test('offline mid-activity: answers kept on device, synced exactly once when back online', async () => {
  const server = new FakeServer();
  const d = new Device(server);
  await d.open(ACT);
  await d.answer(ACT, true);
  server.online = false;
  const r1 = await d.answer(ACT, true);
  const r2 = await d.answer(ACT, false);
  assert.ok(r1.offline && r2.offline);
  assert.equal(d.store.queue().length, 2);
  assert.equal(d.store.attempt(ACT)!.current_index, 3, 'device shows local progress while offline');
  server.online = true;
  const r = await flushQueue(d.store, server.transport());
  assert.equal(r.sent, 2);
  assert.equal(r.remaining, 0);
  const s = [...server.attempts.values()][0];
  assert.equal(s.current_index, 3);
  assert.equal(s.correct_count, 2);
  // Retrying the same events again changes nothing.
  assert.equal(server.events.size, 3);
});

test('started completely offline: the attempt is created on the server when the device reconnects', async () => {
  const server = new FakeServer();
  server.online = false;
  const d = new Device(server);
  const s = await d.open(ACT);
  await d.answer(ACT, true);
  await d.answer(ACT, true);
  server.online = true;
  await flushQueue(d.store, server.transport());
  const saved = server.attempts.get(s.attempt_id)!;
  assert.equal(saved.current_index, 2);
});

test('TEST 5: second device picks up the latest saved progress', async () => {
  const server = new FakeServer();
  const a = new Device(server);
  await a.open(ACT);
  for (let i = 0; i < 3; i++) await a.answer(ACT, true);
  const b = new Device(server); // different storage = different device
  const sb = await b.open(ACT);
  assert.equal(sb.current_index, 3);
  await b.answer(ACT, true);
  // Device A was idle; when it opens the activity again it sees question 5.
  const sa = await a.open(ACT);
  assert.equal(sa.current_index, 4);
});

test('conflict: an old offline answer never overwrites a newer answer from another device', async () => {
  const server = new FakeServer();
  const a = new Device(server);
  await a.open(ACT);
  const b = new Device(server);
  await b.open(ACT);
  server.online = false;
  await a.answer(ACT, false); // A answers Q1 wrong while offline
  server.online = true;
  await b.answer(ACT, true); // B answers Q1 right online
  const r = await flushQueue(a.store, server.transport());
  assert.deepEqual(r.conflicts, [ACT]);
  const s = [...server.attempts.values()][0];
  assert.equal(s.correct_count, 1, 'B\'s newer answer is kept');
  assert.equal(s.current_index, 1);
});

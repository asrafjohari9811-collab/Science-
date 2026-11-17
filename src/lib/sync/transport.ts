'use client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { AuthError, NetworkError, type ServerResult, type Transport } from './queue';

const TIMEOUT_MS = 12000;

type RpcError = { message?: string; code?: string; details?: string } | null;

function classify(error: NonNullable<RpcError>): Error {
  const msg = `${error.message ?? ''} ${error.details ?? ''}`;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return new NetworkError();
  if (!error.code || /fetch|network|abort|timeout/i.test(msg)) return new NetworkError(msg);
  if (/jwt|not signed in|permission denied for function/i.test(msg) || error.code === 'PGRST301') return new AuthError(msg);
  return new Error(msg || 'Save failed');
}

async function call(supabase: SupabaseClient, fn: string, args: Record<string, unknown>): Promise<ServerResult> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) throw new NetworkError();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const { data, error } = await supabase.rpc(fn, args).abortSignal(ctrl.signal);
    if (error) throw classify(error);
    return data as ServerResult;
  } catch (e) {
    if (e instanceof NetworkError || e instanceof AuthError) throw e;
    if (e instanceof Error && e.name === 'AbortError') throw new NetworkError('Timed out');
    if (e instanceof TypeError) throw new NetworkError(e.message); // fetch failed
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Connects the offline queue to the start_attempt / submit_answer database functions. */
export function supabaseTransport(supabase: SupabaseClient): Transport {
  return {
    startAttempt: (activityId, clientAttemptId, restart) =>
      call(supabase, 'start_attempt', { p_activity_id: activityId, p_client_attempt_id: clientAttemptId, p_restart: restart }),
    submitAnswer: (attemptId, index, response, eventId, answeredAt) =>
      call(supabase, 'submit_answer', {
        p_attempt_id: attemptId,
        p_question_index: index,
        p_response: response,
        p_client_event_id: eventId,
        p_answered_at: answeredAt,
      }),
  };
}

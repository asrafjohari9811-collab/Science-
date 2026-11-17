'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getBrowserClient } from '@/lib/supabase/client';
import { LocalStore, flushQueue, type FlushOutcome, type Transport } from '@/lib/sync/queue';
import { supabaseTransport } from '@/lib/sync/transport';
import type { ProgressRow, ScoreRow } from '@/lib/progress';

export interface StudentInfo {
  id: string;
  fullName: string;
  studentCode: string;
  className: string | null;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'offline' | 'signin' | 'error';

interface Ctx {
  student: StudentInfo;
  supabase: SupabaseClient;
  store: LocalStore;
  transport: Transport;
  progress: ProgressRow[];
  scores: ScoreRow[];
  progressLoaded: boolean;
  fromCache: boolean;
  saveStatus: SaveStatus;
  pending: number;
  online: boolean;
  flush: () => Promise<FlushOutcome | null>;
  refreshProgress: () => Promise<void>;
  onFlush: (fn: (o: FlushOutcome) => void) => () => void;
}

const StudentContext = createContext<Ctx | null>(null);

export function useStudent(): Ctx {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used inside <StudentProvider>');
  return ctx;
}

const memoryKV = (() => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
})();

export function StudentProvider({ student, children }: { student: StudentInfo; children: ReactNode }) {
  const supabase = useMemo(() => getBrowserClient(), []);
  const store = useMemo(() => {
    let kv: Storage | typeof memoryKV = memoryKV;
    try {
      if (typeof window !== 'undefined' && window.localStorage) kv = window.localStorage;
    } catch {
      /* private mode */
    }
    return new LocalStore(student.id, kv);
  }, [student.id]);
  const transport = useMemo(() => supabaseTransport(supabase), [supabase]);

  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [progressLoaded, setLoaded] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [pending, setPending] = useState(0);
  const [online, setOnline] = useState(true);

  const listeners = useRef(new Set<(o: FlushOutcome) => void>());
  const inFlight = useRef<Promise<FlushOutcome | null> | null>(null);

  const refreshProgress = useCallback(async () => {
    const [p, s] = await Promise.all([
      supabase.from('student_progress').select('*').eq('student_id', student.id),
      supabase.from('scores').select('*').eq('student_id', student.id).order('completed_at', { ascending: false }),
    ]);
    if (p.error || s.error) {
      const snap = store.snapshot<{ progress: ProgressRow[]; scores: ScoreRow[] }>('progress');
      if (snap) {
        setProgress(snap.progress);
        setScores(snap.scores);
        setFromCache(true);
      }
    } else {
      setProgress(p.data as ProgressRow[]);
      setScores(s.data as ScoreRow[]);
      setFromCache(false);
      store.saveSnapshot('progress', { progress: p.data, scores: s.data });
    }
    setLoaded(true);
  }, [supabase, student.id, store]);

  const flush = useCallback(async () => {
    if (inFlight.current) return inFlight.current;
    if (store.queue().length === 0) {
      setPending(0);
      return null;
    }
    setSaveStatus('saving');
    inFlight.current = (async () => {
      try {
        const outcome = await flushQueue(store, transport);
        setPending(outcome.remaining);
        setSaveStatus(outcome.authRequired ? 'signin' : outcome.offline ? 'offline' : outcome.remaining ? 'error' : 'saved');
        listeners.current.forEach((fn) => fn(outcome));
        if (outcome.sent > 0) void refreshProgress();
        return outcome;
      } finally {
        inFlight.current = null;
      }
    })();
    return inFlight.current;
  }, [store, transport, refreshProgress]);

  const onFlush = useCallback((fn: (o: FlushOutcome) => void) => {
    listeners.current.add(fn);
    return () => void listeners.current.delete(fn);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    setPending(store.queue().length);
    void flush().finally(() => void refreshProgress());
    const goOnline = () => {
      setOnline(true);
      void flush();
    };
    const goOffline = () => setOnline(false);
    const onVisible = () => document.visibilityState === 'visible' && void flush();
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    document.addEventListener('visibilitychange', onVisible);
    // Retry quietly while anything is waiting to be sent.
    const timer = window.setInterval(() => {
      if (store.queue().length) void flush();
    }, 20000);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(timer);
    };
  }, [flush, refreshProgress, store]);

  const value: Ctx = {
    student, supabase, store, transport, progress, scores, progressLoaded, fromCache,
    saveStatus, pending, online, flush, refreshProgress, onFlush,
  };
  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

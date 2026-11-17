'use client';
import { getBrowserClient } from './supabase/client';

/** Remove cached pages so the next person on a shared device never sees the last pupil's screens. */
export async function clearPageCache() {
  try {
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.includes('-pages')).map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
}

export async function signOutEverywhere(redirectTo: string) {
  await clearPageCache();
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
  await getBrowserClient().auth.signOut();
  window.location.assign(redirectTo);
}

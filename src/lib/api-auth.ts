import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionProfile } from './supabase/server';

/** For API routes: returns the signed-in teacher, or a ready-made error response. */
export async function requireTeacher() {
  const { supabase, user, profile } = await getSessionProfile();
  if (!user) return { error: NextResponse.json({ error: 'Not signed in' }, { status: 401 }) } as const;
  if (profile?.role !== 'teacher') return { error: NextResponse.json({ error: 'Teacher access only' }, { status: 403 }) } as const;
  return { supabase, user, profile } as const;
}

export function serverError(e: unknown) {
  const message = e instanceof Error ? e.message : 'Something went wrong';
  return NextResponse.json({ error: message }, { status: 500 });
}

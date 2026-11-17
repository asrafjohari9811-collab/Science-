import { NextResponse } from 'next/server';
import { missingPublicEnv } from '@/lib/env';

/** Quick deployment check: which configuration values are missing (never returns their values). */
export function GET() {
  const missing = [...missingPublicEnv()];
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return NextResponse.json({ ok: missing.length === 0, missing });
}

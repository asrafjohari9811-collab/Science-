// Environment configuration. Public values are inlined at build time by Next.js.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const STUDENT_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_STUDENT_EMAIL_DOMAIN || 'students.sciencequest.app';

export const PUBLIC_ENV_VARS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const;

export function missingPublicEnv(): string[] {
  const missing: string[] = [];
  if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR-PROJECT-REF')) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.startsWith('your-')) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return missing;
}

export const isConfigured = () => missingPublicEnv().length === 0;

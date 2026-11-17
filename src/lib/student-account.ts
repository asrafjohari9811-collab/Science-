// Pupils sign in with a Student ID and a short secret code.
// Behind the scenes each pupil is a Supabase Auth user: email = <student id>@<domain>, password = code.
import { STUDENT_EMAIL_DOMAIN } from './env';

export function normalizeStudentCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function normalizeAccessCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, '');
}

export function studentEmail(studentCode: string): string {
  return `${normalizeStudentCode(studentCode).toLowerCase()}@${STUDENT_EMAIL_DOMAIN}`;
}

export const STUDENT_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,19}$/;

// No 0/O, 1/I/L, 5/S: easy for young children to read and type.
const ALPHABET = '2346789ABCDEFGHJKMNPQRTUVWXYZ';

/** Random 6-character access code (Supabase requires passwords of 6+ characters). */
export function generateAccessCode(length = 6): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

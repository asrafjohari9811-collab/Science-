import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const STUDENT_PATHS = ['/dashboard', '/units', '/learn'];

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next(); // Setup screen explains what is missing.

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Refreshes the session cookie. Role checks happen in the server layouts.
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  const needsStudent = STUDENT_PATHS.some((p) => path === p || path.startsWith(p + '/'));
  const needsTeacher = path.startsWith('/teacher') && !path.startsWith('/teacher/login');
  if (!user && (needsStudent || needsTeacher)) {
    const to = request.nextUrl.clone();
    to.pathname = needsTeacher ? '/teacher/login' : '/login';
    to.search = '';
    return NextResponse.redirect(to);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js|api/health).*)'],
};

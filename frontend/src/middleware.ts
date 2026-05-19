import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('grandline_auth');
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/find-team', '/profile', '/saved', '/active-teams', '/active-team', '/skill-bank', '/teams'];
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected && !authCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if ((pathname === '/' || pathname === '/login' || pathname === '/signup') && authCookie) {
    return NextResponse.redirect(new URL('/find-team', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

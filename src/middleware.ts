import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Behind nginx, `next start -H 127.0.0.1` makes request.url's host
// "localhost:3001", so `new URL(path, request.url)` sent visitors of
// aarikaai.in to https://localhost:3001. Build redirects from the host the
// browser actually used (nginx forwards it in Host / X-Forwarded-Host).
function redirectTo(request: NextRequest, path: string) {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  const base = host && !/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? `${proto}://${host}` : request.url;
  return NextResponse.redirect(new URL(path, base));
}

export function middleware(request: NextRequest) {
  // Read the authToken from the cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  const isPublicPage = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname === '/register' || 
    request.nextUrl.pathname === '/forgot-password' ||
    request.nextUrl.pathname === '/about' ||
    request.nextUrl.pathname === '/privacy' ||
    request.nextUrl.pathname === '/terms' ||
    request.nextUrl.pathname === '/updates-faq' ||
    request.nextUrl.pathname === '/reviews' ||
    request.nextUrl.pathname === '/jobs' ||
    request.nextUrl.pathname === '/open-jobs' ||
    request.nextUrl.pathname === '/community' ||
    request.nextUrl.pathname === '/api-docs' ||
    request.nextUrl.pathname === '/sitemap.xml' ||
    request.nextUrl.pathname === '/robots.txt' ||
    request.nextUrl.pathname.endsWith('.xml') ||
    request.nextUrl.pathname.endsWith('.txt') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico';

  const isAuthOnlyPage = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname === '/register' || 
    request.nextUrl.pathname === '/forgot-password';

  // If there's no auth token and the user is trying to access a protected route
  if (!authToken && !isPublicPage) {
    return redirectTo(request, '/');
  }

  // If there IS an auth token and they are on login/register pages, redirect to chat
  if (authToken && isAuthOnlyPage) {
    return redirectTo(request, '/chat');
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static assets, API routes, images, sitemap, robots, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)'],
};

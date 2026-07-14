import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Read the authToken from the cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  const isAuthPage = 
    request.nextUrl.pathname === '/' || 
    request.nextUrl.pathname === '/register' || 
    request.nextUrl.pathname === '/forgot-password' ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico';

  // If there's no auth token and the user is trying to access a protected route
  if (!authToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If there IS an auth token and they are on the login/register pages, redirect to chat
  if (authToken && isAuthPage && !request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.startsWith('/_next')) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static assets, API routes, images, etc.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

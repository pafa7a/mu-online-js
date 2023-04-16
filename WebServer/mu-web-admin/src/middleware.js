import {NextResponse} from 'next/server';

export function middleware(req) {
  const authCookie = req.cookies.get('auth')?.value;
  const {pathname} = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  // If it's not authenticated.
  if (!authCookie && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If it's authenticated.
  if (authCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

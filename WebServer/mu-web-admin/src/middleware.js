import {NextResponse} from 'next/server';
import {jwtVerify} from 'jose';

export async function middleware(req) {
  let validAuthCookie = false;
  const {pathname} = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next();
  }

  try {
    const authCookie = req.cookies.get('token')?.value;
    validAuthCookie = await jwtVerify(authCookie, new TextEncoder().encode(process.env.AUTH_SECRET));
  } catch (e) {
    /* empty */
  }

  const unprotectedPaths = ['/login', '/api/login'];

  // If it's not authenticated.
  if (!validAuthCookie && !unprotectedPaths.includes(pathname)) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('token');
    return res;
  }

  // If it's authenticated.
  if (unprotectedPaths.includes(pathname)) {
    // If the cookie is valid.
    if (validAuthCookie) {
      return NextResponse.redirect(new URL('/', req.url));
    } else {
      // Just delete the cookie, because it's invalid anyway.
      const res = NextResponse.next();
      // noinspection JSCheckFunctionSignatures
      res.cookies.delete('token');
      return res;
    }
  }
}

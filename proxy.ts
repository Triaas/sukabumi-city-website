import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'sukabumi_session';
const BLOCKED_LEGACY_UPLOAD_EXT_REGEX =
  /\.(?:log|php|json|dat|mmdb|htaccess|sql|txt)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lowerPathname = pathname.toLowerCase();

  if (
    lowerPathname === '/wp-content/uploads' ||
    lowerPathname.startsWith('/wp-content/uploads/')
  ) {
    let decodedPath = pathname;
    try {
      decodedPath = decodeURIComponent(pathname);
    } catch {
      return new NextResponse('Not Found', { status: 404 });
    }

    const cleanPath = decodedPath.replace(/\/+$/, '');
    if (BLOCKED_LEGACY_UPLOAD_EXT_REGEX.test(cleanPath)) {
      return new NextResponse('Not Found', {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value?.trim();

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/reporter/:path*',
    '/ganti-sandi-wajib/:path*',
    '/wp-content/uploads/:path*',
  ],
};

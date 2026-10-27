import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { sessionCookieName } from '@/lib/auth';

const STAFF_ROLES = new Set(['ADMIN', 'AGENT']);

function isPublicPath(pathname: string): boolean {
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/serwist') ||
    pathname.startsWith('/~offline') ||
    pathname.startsWith('/icons')
  ) {
    return true;
  }

  if (
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/manifest.webmanifest/' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png'
  ) {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // El servidor Next escucha en 0.0.0.0:8002 detrás de nginx. Los redirects
  // deben usar el origen público configurado, no la dirección interna.
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const publicOrigin = forwardedHost
    ? `${forwardedProto || req.nextUrl.protocol.replace(':', '')}://${forwardedHost}`
    : process.env.NEXTAUTH_URL || req.nextUrl.origin;
  const publicUrl = new URL(`${pathname}${req.nextUrl.search}`, publicOrigin);

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });

  if (!token) {
    const loginUrl = new URL('/login', publicOrigin);
    loginUrl.searchParams.set('callbackUrl', publicUrl.toString());
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;
  if (!role || !STAFF_ROLES.has(role)) {
    return NextResponse.redirect(new URL('/login', publicOrigin));
  }

  // Pantallas solo para ADMIN: el resto vuelve al inicio en vez de ver un error.
  if ((pathname.startsWith('/reports') || pathname.startsWith('/users/administrators')) && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', publicOrigin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts|public|icons|serwist|~offline|manifest\\.webmanifest).*)',
  ],
};

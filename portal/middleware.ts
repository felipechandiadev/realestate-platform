import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { sessionCookieName } from '@/lib/auth';

const STAFF_ROLES = new Set(['ADMIN', 'AGENT']);
const COMMUNITY_ONLY = ['/favorites', '/myProperties', '/myContracts', '/personalInfo'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: sessionCookieName,
  });

  if (token && STAFF_ROLES.has(token.role as string)) {
    const backofficeUrl =
      process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:8002';
    return NextResponse.redirect(new URL(backofficeUrl));
  }

  if (COMMUNITY_ONLY.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|public|api/auth).*)'],
};

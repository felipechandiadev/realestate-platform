import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Staff tokens should not use the portal app
    if (token && ['ADMIN', 'AGENT'].includes(token.role as string)) {
      const backofficeUrl =
        process.env.NEXT_PUBLIC_BACKOFFICE_URL || 'http://localhost:8002';
      return NextResponse.redirect(new URL(backofficeUrl));
    }

    // Community-only areas
    const communityOnly = ['/favorites', '/myProperties', '/myContracts', '/personalInfo'];
    if (communityOnly.some((p) => pathname.startsWith(p)) && !token) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts|public|api/auth).*)'],
};

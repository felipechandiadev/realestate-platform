import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    console.log('🔐 [Middleware]', {
      pathname,
      hasToken: !!token,
      role: token?.role,
      timestamp: new Date().toISOString(),
    });

    // ============================================
    // RÈGLE 0: Redirigir raíz (/) a /portal/
    // ============================================
    if (pathname === '/') {
      console.log('🔄 [Middleware] Redirigiendo / a /portal/');
      return NextResponse.redirect(new URL('/portal/', req.url));
    }

    // ============================================
    // RÈGLE 1: ADMIN/AGENT en /portal → redirigir a /backOffice
    // ============================================
    if (pathname.startsWith('/portal') && token && ['ADMIN', 'AGENT'].includes(token.role as string)) {
      console.log(`🚫 [Middleware] ${token.role} no debe estar en /portal, redirigiendo a /backOffice`);
      return NextResponse.redirect(new URL('/backOffice', req.url));
    }

    // ============================================
    // RÈGLE 2: COMMUNITY en /backOffice → redirigir a /portal
    // ============================================
    if (pathname.startsWith('/backOffice') && token && token.role === 'COMMUNITY') {
      console.log('🚫 [Middleware] Usuario COMMUNITY no tiene acceso a /backOffice, redirigiendo a /portal');
      return NextResponse.redirect(new URL('/portal', req.url));
    }

    // ============================================
    // RÈGLE 3: Proteger /backOffice - solo ADMIN y AGENT
    // ============================================
    if (pathname.startsWith('/backOffice')) {
      console.log('🔒 [Middleware] Protegiendo acceso a /backOffice');

      // Sin token → redirigir al home
      if (!token) {
        console.log('🚫 [Middleware] No hay token, redirigiendo a /');
        return NextResponse.redirect(new URL('/', req.url));
      }

      // Con token pero rol invalido → redirigir al home
      if (!token.role || !['ADMIN', 'AGENT'].includes(token.role as string)) {
        console.log(`🚫 [Middleware] Rol no autorizado "${token.role}" para /backOffice, redirigiendo a /`);
        return NextResponse.redirect(new URL('/', req.url));
      }

      console.log(`✅ [Middleware] ${token.role} autorizado en /backOffice`);
    }

    // ============================================
    // RÈGLE 4: Portal es accesible para todos
    // - No autenticados → acceso libre
    // - COMMUNITY → acceso permitido
    // - ADMIN/AGENT → redirigir a /backOffice (ya cubierto por RÈGLE 1)
    // ============================================
    if (pathname.startsWith('/portal')) {
      console.log('✅ [Middleware] Acceso a /portal permitido');
    }

    console.log('✅ [Middleware] Middleware completado sin redirecciones');
  },
  {
    callbacks: {
      // Solo permitir continuar si hay token válido O si es ruta pública (portal)
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Portal es completamente público
        if (pathname.startsWith('/portal') || pathname.startsWith('/publish')) {
          return true;
        }

        // BackOffice requiere token válido
        if (pathname.startsWith('/backOffice')) {
          return !!token;
        }

        // Rutas raíz y públicas (/, /signin, etc.) permitidas
        return true;
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};

import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirigir ADMIN y AGENT del portal al backOffice
    if (pathname.startsWith('/portal') && token && ['ADMIN', 'AGENT'].includes(token.role as string)) {
      console.log('Middleware - Usuario', token.role, 'en portal, redirigiendo a backOffice');
      return NextResponse.redirect(new URL('/backOffice', req.url));
    }

    // Solo aplicar restricciones a rutas del backoffice
    if (pathname.startsWith('/backOffice')) {
      console.log('Middleware - Acceso a backoffice:', pathname);
      console.log('Middleware - Token presente:', !!token);
      console.log('Middleware - Token role:', token?.role);

      // Verificar autenticación
      if (!token) {
        console.log('Middleware - No hay token, redirigiendo a /');
        return NextResponse.redirect(new URL('/', req.url));
      }
      // Verificar rol: solo admin o agente pueden acceder
      if (!token.role || !['ADMIN', 'AGENT'].includes(token.role as string)) {
        console.log('Middleware - Rol no autorizado:', token.role, '- redirigiendo a /');
        return NextResponse.redirect(new URL('/', req.url));
      }

      console.log('Middleware - Acceso permitido para rol:', token.role);
    }
    // Rutas públicas (portal, etc.) no tienen restricciones para usuarios COMMUNITY
  },
  {
    callbacks: {
      authorized: () => true, // Manejar lógica manualmente en la función middleware
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
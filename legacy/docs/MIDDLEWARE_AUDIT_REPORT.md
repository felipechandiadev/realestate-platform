# 🔍 Frontend Middleware Audit Report

**Fecha:** 7 de marzo de 2026  
**Estado:** ⚠️ CRÍTICO - Se encontraron problemas importantes

---

## 📋 Resumen Ejecutivo

El middleware del frontend tiene una **estructura parcialmente correcta**, pero existen **3 problemas críticos** que impiden que funcione correctamente:

1. ❌ **Ubicación incorrecta del archivo** (`proxy.ts` → debe ser `middleware.ts`)
2. ⚠️ **Router no protege rutas de autenticación** (fallback insuficiente)
3. ⚠️ **Token no se refresca automáticamente** en rutas protegidas

---

## 🔴 PROBLEMA CRÍTICO #1: Archivo en ubicación incorrecta

### Ubicación actual:
```
frontend/proxy.ts ❌
```

### Ubicación requerida por Next.js:
```
frontend/middleware.ts ✅
```

### Impacto:
- **Next.js NO reconoce el middleware** porque no está en la ubicación esperada
- El matcher y las reglas de protección **no se aplican**
- Las rutas protegidas (`/backOffice`) son accesibles sin autenticación
- Los redirects no funcionan correctamente

### Solución:
Renombrar `proxy.ts` → `middleware.ts`

---

## 📊 Revisión detallada de `proxy.ts`

### Estructura actual:

```typescript
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // ✅ Redirect ADMIN/AGENT del portal al backOffice
    if (pathname.startsWith('/portal') && token && ['ADMIN', 'AGENT'].includes(token.role)) {
      return NextResponse.redirect(new URL('/backOffice', req.url));
    }

    // ✅ Verificar rutas del backOffice
    if (pathname.startsWith('/backOffice')) {
      if (!token) {
        return NextResponse.redirect(new URL('/', req.url));
      }
      if (!['ADMIN', 'AGENT'].includes(token.role)) {
        return NextResponse.redirect(new URL('/', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => true, // ⚠️ PROBLEM: Siempre retorna true
    },
  }
)

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

---

## ⚠️ PROBLEMA #2: Callback `authorized` siempre retorna `true`

### Línea problemática:
```typescript
authorized: () => true, // ❌ INSEGURO
```

### Problema:
- `withAuth` siempre continúa la ejecución, bypass de seguridad
- La lógica de protección depende **únicamente** de redirecciones internas
- Si hay un error de renderización después del redirect, la página podría ser accesible

### Detalles técnicos:
```typescript
// Lo que debería estar:
authorized: ({ token }) => {
  // Retornar false para bloquear rutas protegidas sin token
  return !!token; // ✅ CORRECTO
},
```

### Impacto: MODERADO
- Las rutas se protegen por redirect, pero falta validación en el gateway
- Usuarios no autenticados podrían ver contenido parcial durante el redirect

---

## ⚠️ PROBLEMA #3: Falta refresco automático de token

### Contexto:
- Token JWT expira en **12 horas** (`maxAge: 12 * 60 * 60` en `lib/auth.ts`)
- No hay mecanismo de refresh automático en rutas protegidas
- El middleware no verifica validez del token

### Consecuencia:
- Usuario con token expirado obtiene error silencioso
- No hay redirección a login después de expiración
- Experiencia de usuario degradada (pantalla en blanco o error)

### Recomendación:
Implementar refresh de token en middleware o en `apiClient.ts`

---

## 📝 Configuration Audit

### ✅ Bien configurado:

| Elemento | Ubicación | Estado |
|----------|-----------|--------|
| NextAuth Secret | `.env` | ✅ Presente |
| NEXTAUTH_URL | `.env` | ✅ Correcto (http://localhost:3001) |
| JWT Strategy | `lib/auth.ts:36` | ✅ Configurado |
| Session Maxage | `lib/auth.ts:36` | ✅ 12 horas |
| CustomProvider | `ClientProviders.tsx:24` | ✅ Inicializado |
| SessionProvider | `ClientProviders.tsx:28` | ✅ Presente |
| Callbacks JWT | `lib/auth.ts:94` | ✅ Completos |
| Callbacks Session | `lib/auth.ts:108` | ✅ Incluye accessToken y role |

### ⚠️ Requiere atención:

| Elemento | Ubicación | Problema | Solución |
|----------|-----------|----------|----------|
| Matcher | proxy.ts:40 | Muy amplio (excluye solo algunos paths) | Considerar ser más restrictivo |
| Authorized | proxy.ts:33 | Siempre `true` | Cambiar a `return !!token` |
| Middleware | proxy.ts | Archivo sin reconocer | Renombrar a `middleware.ts` |
| Token Refresh | (No existe) | Sin refresco automático | Implementar refresh logic |

---

## 🔐 Flujo actual de autenticación

```
1. Usuario ingresa credenciales en /portal/signin
   ↓
2. AuthContext.login() → POST /api/auth/login
   ↓
3. NextAuth.signIn("credentials") → Backend valida
   ↓
4. JWT token generado y guardado en HttpOnly cookie
   ↓
5. SessionProvider refesca sesión
   ↓
6. Middleware verifica token (⚠️ NO FUNCIONA - archivo en ubicación incorrecta)
   ↓
7. Si ADMIN/AGENT → redirect a /backOffice ✅
   ↓
8. Si acceso a /backOffice sin token → redirect a / (⚠️ depende de redirección)
```

---

## 🚀 Recomendaciones por Prioridad

### 🔴 CRÍTICA - Hacer inmediatamente:

1. **Renombrar `proxy.ts` → `middleware.ts`**
   ```bash
   mv frontend/proxy.ts frontend/middleware.ts
   ```

2. **Cambiar callback `authorized`:**
   ```typescript
   // Cambiar de:
   authorized: () => true,
   
   // A:
   authorized: ({ token }) => !!token,
   ```

### 🟠 IMPORTANTE - Próxima sesión:

3. **Implementar token refresh automático en `StepperBaseForm`:**
   ```typescript
   // En lib/auth.ts o en lib/apiClient.ts
   if (error.status === 401) {
     await signOut({ redirect: true, callbackUrl: '/portal' });
   }
   ```

4. **Agregar validación en rutas críticas:**
   ```typescript
   // En app/portal/(protected)/page.tsx
   const { data: session } = useSession();
   if (session?.accessToken?.expired) {
     redirect('/portal/signin');
   }
   ```

### 🟡 RECOMENDADA - Mejorar:

5. **Hacer matcher más específico:**
   ```typescript
   matcher: ['/backOffice/:path*', '/portal/:path*'],
   ```

6. **Agregar logging en middleware:**
   ```typescript
   console.log('[Middleware]', {
     pathname,
     hasToken: !!token,
     role: token?.role,
     timestamp: new Date().toISOString(),
   });
   ```

---

## 📋 Checklist de verificación post-fix

- [ ] Renombrar `proxy.ts` → `middleware.ts`
- [ ] Cambiar `authorized: () => true` → `authorized: ({ token }) => !!token`
- [ ] Compilar: `npm run build`
- [ ] Probar acceso a `/backOffice` sin token (debe redirigir)
- [ ] Probar acceso a `/backOffice` con token COMMUNITY (debe redirigir)
- [ ] Verificar token expiracion en SessionProvider
- [ ] Confirmar redirección correcta para ADMIN/AGENT en portal

---

## 🔗 Archivos relacionados

- **Middleware:** `frontend/proxy.ts` (debe ser `middleware.ts`)
- **Auth config:** `frontend/lib/auth.ts`
- **Session provider:** `frontend/app/ClientProviders.tsx`
- **Auth context:** `frontend/app/providers.tsx`
- **API client:** `frontend/lib/apiClient.ts`
- **Next config:** `frontend/next.config.ts`

---

## 📞 Siguiente paso

Después de esta auditoría, **requiere acción inmediata** en los problemas críticos para que el sistema de autenticación funcione correctamente.


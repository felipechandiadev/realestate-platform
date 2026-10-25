# 06 · Arquitectura técnica

## 6.1 Vista de alto nivel

```
          Visitantes / clientes                Admins / agentes
                   │                                  │
                   ▼                                  ▼
        ┌────────────────────┐            ┌────────────────────┐
        │ Portal (Next.js)   │            │ Backoffice (Next.js│
        │ :8001              │            │ + PWA) :8002       │
        └─────────┬──────────┘            └─────────┬──────────┘
                  │    HTTP/JSON + JWT (NextAuth)    │
                  └───────────────┬─────────────────┘
                                  ▼
                       ┌────────────────────┐   WebSocket (notificaciones)
                       │ API core (NestJS)  │◄──────────────────────────
                       │ :8000              │
                       └──┬──────┬──────┬───┘
                          │      │      │
                     MySQL 8   R2     Resend
                    (datos) (archivos) (correo)
```

Regla clave: **los frontends no acceden a la base de datos**. Toda lectura, escritura, permiso y archivo pasa por la API.

## 6.2 Repositorio (monorepo)

```
portal/               Sitio público (Next.js 16, React 19, Tailwind)
backoffice/           Panel interno (Next.js 16, React 19, PWA con Serwist)
core/                 API (NestJS 11, TypeORM 0.3, MySQL)
packages/ui/          @realestate/ui: componentes y tema compartidos
packages/api-client/  @realestate/api-client: cliente HTTP compartido
envs/                 Plantillas *.env.example (sin valores)
deploy/               Plantillas de nginx y script de despliegue
scripts/              Utilidades de desarrollo
doc/                  Documentación
```

Gestión con **npm workspaces** (portal, backoffice, packages). `core` se instala aparte (`npm install --prefix core`).

## 6.3 Frontends (portal y backoffice)

- **Next.js App Router**: páginas en `app/`, lógica de dominio en `src/features/<dominio>/` (acciones de servidor, componentes, tipos).
- **Server actions** llaman a la API desde el servidor; el navegador no ve el token de la API directamente.
- **NextAuth** (JWT) maneja la sesión. La API emite el token al hacer login.
- **Tailwind CSS** + tokens de color de `@realestate/ui`. Tema claro fijo.
- **next/image** para imágenes remotas de R2 (hosts permitidos en `next.config.ts`).

## 6.4 API (core)

Arquitectura por **módulos** con capas tipo hexagonal:

```
core/src/modules/<modulo>/
  domain/          Entidades y contratos de repositorio
  application/     Casos de uso y servicios
  infrastructure/  Repositorios TypeORM, adaptadores externos
  presentation/    Controladores REST, DTOs, gateways
```

Módulos: `auth`, `users`, `password-recovery`, `person`, `property`, `property-types`, `multimedia`, `media-optimization`, `contracts`, `document`, `documents`, `document-types`, `identities`, `appearance`, `portal-header`, `portal-footer`, `portal-featured`, `portal-listings`, `slide`, `about-us`, `team-members`, `testimonials`, `articles`, `notifications`, `mail`, `audit`, `analytics`, `predict`, `config`.

Transversales:
- **Validación** de entrada con DTOs (`class-validator`).
- **Guards** de JWT y de rol/permiso.
- **Throttling** (límite de solicitudes) en endpoints públicos sensibles.
- **Swagger** en `/api` solo fuera de producción.
- **WebSocket** (`notifications.gateway.ts`) para notificaciones en tiempo real.

## 6.5 Paquete de UI compartido

`packages/ui` contiene componentes base (TextField, Select, Dialog, botones, etc.) y los tokens visuales. Es una versión adaptada de una librería interna (kai-ui); no se sincroniza automáticamente con su origen. Ver [Correcciones UI móvil](../LISTADO_CORRECCIONES_UI_MOBILE.md).

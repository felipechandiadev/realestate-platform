# Real Estate Platform

Monorepo npm workspaces: **portal** (público), **backoffice** (admin), **packages/** (UI + API client) y **core** (NestJS API, fuera de workspaces).

## Arquitectura

```
portal/          Next.js — sitio público (puerto 8001)
backoffice/      Next.js — panel admin + PWA (puerto 8002)
core/            NestJS + TypeORM — API / auth / media (puerto 8000)
packages/ui      Componentes y tema compartidos (@realestate/ui)
packages/api-client  Cliente HTTP compartido (@realestate/api-client)
envs/            *.env.example + sync-dev-envs.sh
deploy/          Plantillas nginx / deploy (sin secretos)
doc/             Notas de migración, deuda TS, dedup, auditorías
```

Hosting de referencia: PM2 + nginx (dominios en `deploy/nginx/`); archivos en Cloudflare R2.

## Puertos locales

| Servicio    | Puerto | Script |
|-------------|--------|--------|
| Core API    | 8000   | `npm run core:dev` / `npm run dev:core` |
| Portal      | 8001   | `npm run dev:portal` |
| Backoffice  | 8002   | `npm run dev:backoffice` |
| Ambos front | —      | `npm run dev:apps` |
| Todo (bash) | —      | `npm run dev` → `scripts/dev-all.sh` |

## Variables de entorno (solo nombres)

**No commits de secretos.** Copia desde ejemplos:

- `envs/portal.env.example` → `portal/.env.local`
- `envs/backoffice.env.example` → `backoffice/.env.local`
- `envs/core.env.example` / `core/.env.example` → `core/.env`
- `envs/shared.env.example`
- Sync local: `npm run env:dev` (`envs/sync-dev-envs.sh`)

Nombres frecuentes (valores en los ejemplos):

- Portal/Backoffice: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AUTH_API_URL`, `NEXT_PUBLIC_AUTH_API_URL`, `BACKEND_API_URL`, `NEXT_PUBLIC_UPLOAD_BASE_URL`, `NEXT_PUBLIC_PORTAL_URL`, `NEXT_PUBLIC_BACKOFFICE_URL`, `PORT`
- Core: `DATABASE_*`, `JWT_SECRET`, `FRONTEND_PUBLIC_URL` / `PORTAL_URL`, `BACKEND_PUBLIC_URL`, `STORAGE_PROVIDER`, `R2_*` (`R2_PUBLIC_URL`, `R2_BUCKET_NAME`, …), mail, etc.

Si `.env.dev` estuvo trackeado con secretos en el pasado, **rotar credenciales** (pendiente desde fase 0).

## Cómo correr en local

```bash
npm install                 # workspaces (portal, backoffice, packages)
npm install --prefix core   # API
npm run env:dev             # opcional: sincroniza envs de desarrollo
npm run core:dev            # terminal 1
npm run dev:apps            # terminal 2 — portal + backoffice
```

Mailhog opcional: `npm run mail:dev` (`docker-compose.mail.yml`).

## Calidad / CI

Workflow: `.github/workflows/ci.yml`

- `npm run typecheck:portal`
- `npm run typecheck:backoffice` (0 errores; el build ya no usa `ignoreBuildErrors`)
- `npm run typecheck:core`
- `npm run lint:portal` / `npm run lint:backoffice` (0 errores; `no-explicit-any` es `error` en portal y `warn` en backoffice)
- `npm run test:core:unit`

Frontend Jest del portal: **no instalado**; smoke con Node: `npm run test -w portal`. Ver `portal/tests/README.md` y `doc/tsc-debt.md`.

## Migraciones

Baseline y procedimiento: **`core/database/BASELINE.md`**.

En deploy, las migraciones deben ir detrás de confirmación explícita (`CONFIRM_MIGRATION=yes` en la plantilla).

## Deploy (overview)

1. Revisar/adaptar `deploy/nginx.conf.example` (HSTS, headers, `limit_req` en `/auth`, reenvío de IP cliente).
2. Usar `deploy/deploy.sh.example` como guión: `npm ci` → builds → migraciones con `CONFIRM_MIGRATION` → `pm2 reload`.
3. Completar nombres PM2, rutas SSL y dominios en el servidor (no hay secretos en el repo).
4. Confirmar que `next/image` `remotePatterns` incluye el host real de `R2_PUBLIC_URL` si no es uno de los `pub-*.r2.dev` ya listados.

## Documentación útil

- `doc/dedup-remaining.md` — qué se compartió y qué sigue duplicado
- `doc/client-components-audit.md` — páginas `'use client'` a revisar
- `doc/tsc-debt.md` / `doc/typescript-strictness.md`
- Tag local `archive/legacy-pre-fase-6` — snapshot previo a borrar `legacy/`

## Licencia / audiencia

Uso interno del proyecto inmobiliario. No publicar secretos ni dumps de BD en el repo.

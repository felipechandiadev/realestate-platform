# Copilot Instructions

Monorepo post-split (ver `doc/PLAN_PASO_A_PASO_SPLIT.md`):

| Path | Rol |
|------|-----|
| `/core` | API NestJS (fuera de workspaces npm) |
| `/portal` | Next.js público + community (:8001) |
| `/backoffice` | Next.js admin/agentes (:8002) |
| `/packages/ui` | `@realestate/ui` design system |
| `/packages/api-client` | `@realestate/api-client` cliente HTTP compartido |

**Regla número 1:** aplica cambios en el subproyecto correcto. `legacy/` fue eliminado (tag `archive/legacy-pre-fase-6`).

---

## Core (NestJS) — `/core`

- DDD por feature: `presentation/` → `application/` → `domain/`; `infrastructure/` → `domain/`
- Alias: `@modules/*`, `@shared/*`
- Auth: `POST /auth/staff/sign-in`, `POST /auth/community/sign-in`, `RolesGuard` + `@Roles`
- Comandos: `npm run core:dev` / `npm install --prefix core`

---

## Portal — `/portal`

- Rutas en `app/`; features en `src/features/` y `features/`
- Cookie: `next-auth.session.portal`
- UI: `@realestate/ui` + componentes de dominio locales
- Ver `portal/AGENTS.md`

---

## Backoffice — `/backoffice`

- Rutas en `app/`; features en `src/features/`
- Cookie: `next-auth.session.backoffice`
- Capas: actions → `infrastructure/*.request.ts` → core
- Ver `backoffice/AGENTS.md`

---

## Shared UI — `/packages/ui`

```ts
import { Button, Dialog, DataGrid } from "@realestate/ui";
```

`npm run ui:typecheck`

---

## Dev

```bash
npm install                 # portal + backoffice + ui
npm run install:core
bash envs/sync-dev-envs.sh
bash scripts/dev-all.sh     # core + portal + backoffice
```

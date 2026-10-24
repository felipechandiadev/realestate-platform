# Backoffice AGENTS

## Alcance

App Next.js staff (`ADMIN` / `AGENT`) en puerto **8002**. Habla con `core/` vía Server Actions → `infrastructure/*.request.ts`.

## Reglas

1. **No** importar desde `legacy/`.
2. **No** `fetch` al backend desde componentes cliente. Solo `*.request.ts` (o actions que deleguen a request).
3. **Primitivos UI solo desde `@realestate/ui`**. No usar `@/shared/components/ui` para primitivos ya migrados. Shell/dominio (TopBar, auth forms, BaseForm, FileUploader) viven en esta app.
4. Auth: cookie `next-auth.session.backoffice`; login `POST /auth/staff/sign-in`.
5. Features en `src/features/{domain}/`.
6. Inventario UI: `packages/ui/INVENTORY.md`. Snapshots superados: `legacy/ui/` (no importar).

## Capas

```
UI → actions/*.action.ts → infrastructure/*.request.ts → core API
```

Referencia de request: `src/features/users/infrastructure/users.request.ts`

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

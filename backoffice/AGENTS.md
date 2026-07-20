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

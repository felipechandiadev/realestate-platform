# Portal AGENTS

## Alcance

App Next.js pública + community en puerto **8001**. Habla con `core/` vía Server Actions → `infrastructure/*.request.ts`.

## Reglas

1. **No** importar desde `legacy/`.
2. **No** `fetch` al backend desde componentes cliente. Solo `*.request.ts` (o actions que deleguen a request).
3. **Primitivos UI solo desde `@realestate/ui`** (Button, Dialog, DataGrid, LocationPicker, etc.). No usar `@/shared/components/ui` para primitivos ya migrados. Dominio (Property*, Splash, Logo, Contact, TopBar, auth forms, BaseForm, FileUploader) vive en esta app; copias de referencia en `legacy/ui` y `legacy/components-realestate/` (nunca importar desde legacy).
4. Auth: cookie `next-auth.session.portal`; login `POST /auth/community/sign-in`.
5. Features en `src/features/` y `features/` (shared/cms).
6. LocationPicker canónico = variante portal (sell-property), exportada por `@realestate/ui` (`LocationPicker`, `LocationPickerWrapper`, `LocationPreview`).

## Capas

```
UI → actions/*.action.ts → infrastructure/*.request.ts → core API
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

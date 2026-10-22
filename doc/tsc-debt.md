# Deuda TypeScript (fase 5)

Fecha: 2026-10-22 (America/Santiago)

## Resumen

| Paquete | Baseline (inicio fase 5) | Actual | `ignoreBuildErrors` |
|---------|--------------------------|--------|---------------------|
| core | 1 (mail-usecases TS2554) | **0** | n/a |
| portal | ~2 TS1010 (+ ocultos por comentarios rotos; luego 64) | **0** | **eliminado** |
| backoffice | ~242 | **~126** | **sigue activo** en `backoffice/next.config.ts` |

## Por qué sigue `ignoreBuildErrors` en backoffice

Quedan ~126 errores que no se pueden cerrar sin refactors de formularios/diálogos
(props de TextField/Select/Dialog, BadgeVariant, columnas DataGrid, modelos CMS, etc.).
No se usó `// @ts-ignore` masivo.

CI ejecuta `tsc --noEmit` también en backoffice y **falla** a propósito hasta bajar esta lista.

## Categorías restantes (backoffice, conteo aproximado)

| Código | Cant. | Tema |
|--------|------:|------|
| TS2322 | ~105 | Props incompatibles (TextField value/onChange, Dialog title/description, number vs string, BadgeVariant, DataGrid columns, Button variants residuales) |
| TS2345 | ~6 | Hooks/actions con `void` vs DTO; argumentos de función |
| TS2307 | ~5 | Módulos faltantes / paths |
| TS7006 | ~4 | Parámetros implícitos `any` (model) |
| TS2551 / TS2339 | ~4 | `multimedia` vs `multimediaUrl` en Article/Testimonial |
| TS18047 | ~2 | `dateRange` posiblemente null |

### Clusters TS2322 más frecuentes

1. ~32 TextField: shape de props (p.ej. value/onChange tipado distinto al de `@realestate/ui`).
2. ~17 Dialog: `open`/`onClose`/`title`/`description` no coinciden con el Dialog del design system.
3. ~13 `number` no asignable a `string` (steppers/inputs).
4. ~7 TextField con `type` string genérico.
5. ~6 Select onChange `string | number | null`.
6. BadgeVariant (`default`/`error`/…) y columnas DataGrid.

## CI

- Workflow: `.github/workflows/ci.yml`
- Corre: `npm ci` (root) + `npm ci --prefix core`, typecheck portal/backoffice/core, lint, jest portal/backoffice, jest **unit** de core.
- **No** corre integración de core (necesita MySQL + `core/.env.test` / secrets).
- Node 22 (compatible con `engines.node: >=20`).

## Próximos pasos sugeridos

1. Alinear diálogos CMS/contratos/usuarios a las props reales de `@realestate/ui` (Dialog, TextField, Select).
2. Unificar BadgeVariant y columnas DataGrid.
3. Cuando backoffice llegue a 0 errores: quitar `typescript.ignoreBuildErrors` de `backoffice/next.config.ts`.

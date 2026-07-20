# legacy/ui/

Primitivos UI **superados** durante la migración a `@realestate/ui`. Solo referencia; no es runtime.

## Estructura

| Path | Qué es |
|------|--------|
| `from-kai-ui/` | Variantes originales de KAI que se reemplazaron en `packages/ui` |
| `from-apps/portal/` | Copias locales de `portal/shared/components/ui` tras cutover a package |
| `from-apps/backoffice/` | Idem para backoffice |

## Reglas

- `portal/`, `backoffice/`, `packages/ui` y `core/` **nunca** importan desde aquí.
- Mover aquí **antes** de borrar/reemplazar en runtime.
- Cada carpeta de componente debe incluir `MIGRATION.md` (origen, destino, fecha, validación).

## Índice de decisiones

| Componente | Origen | Destino canónico | Fecha | Estado |
|------------|--------|------------------|-------|--------|
| LocationPicker (KAI) | `packages/ui` | `@realestate/ui` (portal sell-property) | 2026-07-20 | archived in `from-kai-ui` |
| LocationPicker (apps) | portal/backoffice shared | `@realestate/ui` | 2026-07-20 | archived in `from-apps` |
| Button, IconButton, Alert, Badge, Skeleton | apps shared | `@realestate/ui` | 2026-07-20 | archived in `from-apps` |
| TextField, Select, Switch, Tabs, DotProgress, NumberStepper, RangeSlider | apps shared | `@realestate/ui` | 2026-07-20 | archived in `from-apps` |
| Dialog, Card, Dropdown*, AutoComplete, Stepper, DataGrid | apps shared | `@realestate/ui` | 2026-07-20 | archived in `from-apps` |

Ver también [`packages/ui/INVENTORY.md`](../../packages/ui/INVENTORY.md).

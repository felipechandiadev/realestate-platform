# legacy/

Código **pre-split** conservado para evaluación. No es parte del runtime.

## Reglas

- Las apps `portal/`, `backoffice/`, `packages/ui` y `core/` **no deben importar** nada desde aquí.
- Si un componente hace falta, **copiarlo** a su destino y adaptar imports.
- Priorizar revisión de `components-realestate/` (dominio inmobiliario propio).
- Borrar subcarpetas de legacy **solo** cuando el equipo confirme que ya no aportan valor
  (idealmente tras 1–2 sprints de estabilidad post-split).

## Contenido

| Path | Qué es |
|------|--------|
| `frontend/` | Snapshot completo del monolito Next pre-split |
| `components-realestate/` | Componentes especializados realEstate para clasificar (Property*, Splash, Contact, Logo, …) |
| `ui/` | Primitivos superados en la migración a `@realestate/ui` (`from-kai-ui/`, `from-apps/`) |
| `docs/` | Documentos `.md` que estaban en la raíz del repo (roadmaps, audits, quick start, etc.) |

Documentación activa del split: `doc/` en la raíz del monorepo (no legacy).

## Inventario inicial `components-realestate/`

- PropertyFilterSale
- PropertyFilterRent
- PropertyCardSkeleton
- ContactDialog
- SplashScreen
- Logo

## Inventario `ui/`

Ver [`ui/README.md`](./ui/README.md). Apps y `packages/ui` **no importan** desde aquí.
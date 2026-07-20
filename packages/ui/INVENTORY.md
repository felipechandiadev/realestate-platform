# Inventario UI — migración a `@realestate/ui`

Estados: `package` · `app-local` · `legacy` · `done`

## Clasificación

| Destino | Componentes |
|---------|-------------|
| `@realestate/ui` | Alert, AutoComplete, Badge, Button, Card, CollectionGrid, DataGrid, Dialog, DotProgress, DropdownList, IconButton, **LocationPicker (portal/sell-property)**, NumberStepper, RangeSlider, Select, Skeleton, Stepper, Switch, Tabs, TextField, layouts |
| Por app (dominio/shell) | PropertyFilter*, PropertyCardSkeleton, SplashScreen, Logo, ContactDialog, TopBar, LoginForm/RegisterForm, FileUploader, BaseForm, DeleteButton, FullScreenLoader, LazyImage, IconWithFallback |
| Solo legacy | Variantes KAI reemplazadas; copias locales archivadas en `legacy/ui/from-apps/` |

## Checklist vivo

| Componente | Canonical source | Status |
|------------|------------------|--------|
| LocationPicker + Preview | portal sell-property → `@realestate/ui` | **done** |
| Button, IconButton | `@realestate/ui` | **done** |
| Alert, Badge, Skeleton | `@realestate/ui` | **done** |
| TextField, Select, Switch, Tabs | `@realestate/ui` | **done** |
| DotProgress, NumberStepper, RangeSlider | `@realestate/ui` | **done** |
| Dialog, Card | `@realestate/ui` | **done** |
| DropdownList, AutoComplete, Stepper | `@realestate/ui` | **done** |
| DataGrid | `@realestate/ui` | **done** |
| CollectionGrid | `@realestate/ui` | **done** (cards + header + paginación; ver `CollectionPageLayout` sin footer) |
| layouts | `@realestate/ui` (disponibles; apps las adoptan bajo demanda) | package |
| PropertyFilterSale/Rent | portal | app-local |
| PropertyCardSkeleton | portal | app-local |
| SplashScreen, Logo, ContactDialog | portal | app-local |
| TopBar | por app | app-local |
| LoginForm / RegisterForm | por app | app-local |
| BaseForm | por app (consume `@realestate/ui`) | app-local |
| FileUploader | por app | app-local |

## Legacy snapshots

- `legacy/ui/from-kai-ui/LocationPicker` — variante KAI reemplazada
- `legacy/ui/from-apps/{portal,backoffice}/` — primitivos locales tras cutover

Regla: apps y `packages/ui` **nunca** importan desde `legacy/`.

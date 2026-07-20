# `@realestate/ui`

Librería de componentes React compartidos entre **portal** y **backoffice**.

Base adaptada desde `@kai/ui` (KaiStore), con excepciones canónicas documentadas en [`INVENTORY.md`](./INVENTORY.md).

Los tokens de marca se definen en cada app (`globals.css`); los componentes usan variables CSS.

## Uso

```ts
import {
  Button,
  Dialog,
  Alert,
  DataGrid,
  Tabs,
  Card,
  LocationPicker,
  LocationPickerWrapper,
  LocationPreview,
} from "@realestate/ui";
```

**LocationPicker:** fuente canónica = portal `sell-property` (no la variante KAI original; esa está en `legacy/ui/from-kai-ui/LocationPicker`).

## Scripts

```bash
npm run typecheck -w @realestate/ui
# o desde la raíz:
npm run ui:typecheck
```

## Alcance

Primitivos UI genéricos, DataGrid y layouts base.

**No incluir aquí** (van en cada app o en `legacy/components-realestate/`):

- TopBar / SideBar específicos de producto
- PropertyFilter*, PropertyCard*, SplashScreen, Logo, ContactDialog
- LoginForm / RegisterForm (auth distinto por app)
- BaseForm / FileUploader (feature de app; consumen este package)

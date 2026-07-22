# `@realestate/ui`

Librería de componentes React compartidos entre **portal** y **backoffice**.

Base adaptada desde `@kai/ui` (KaiStore), con excepciones canónicas documentadas en [`INVENTORY.md`](./INVENTORY.md).

## Estilos

Los componentes usan CSS colocated (clases `.fs-*`) + utilidades Tailwind + variables CSS.

### Contrato por app (portal / backoffice)

1. En `app/globals.css`, importar tokens y el barrel de componentes **antes** de `@tailwind`:

```css
@import '../../packages/ui/src/theme/tokens.css';
@import '../../packages/ui/src/theme/components.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

2. En `tailwind.config.cjs`, incluir el package en `content` para que se generen las utilidades usadas en el TSX del UI:

```js
content: [
  // ... rutas de la app
  '../packages/ui/src/**/*.{js,ts,jsx,tsx}',
],
```

3. Marca: overrides en `:root` de la app (`--color-*` hex y `--color-*-rgb` para opacidad Tailwind). Incluir `--color-muted-foreground` / `--color-muted-foreground-rgb`.

4. Uso de componentes: basta con importar desde el package; no hace falta importar CSS de cada componente a mano.

```ts
import { TextField, Button, Dialog } from "@realestate/ui";
```

`components.css` asegura el CSS estructural aunque falle un side-effect. El scan de Tailwind sigue siendo obligatorio para clases como `text-foreground`, `border-border`, `focus:border-primary`.

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

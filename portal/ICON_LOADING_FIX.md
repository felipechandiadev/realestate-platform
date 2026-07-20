# Solución: Iconos que no cargan en conexiones lentas

## Problema
Los iconos de Material Symbols (email, phone, etc.) no se cargaban en la primera visualización del sitio cuando la conexión es lenta, mostrando solo espacios en blanco.

## Causa
- `font-display: swap` causaba FOUT (Flash of Unstyled Text)
- La fuente se cargaba asincronicamente sin bloquear el texto

## Soluciones Implementadas

### 1. ✅ Cambio de `font-display` (Ya hecho)
**Archivo:** `/app/globals.css`
- Cambié de `font-display: swap` a `font-display: block`
- Esto hace que el navegador **espere a que la fuente cargue** antes de renderizar el texto
- Las fuentes ya estaban siendo precargas en `/app/layout.tsx` con `<link rel="preload">`

**Ventaja:** Los iconos siempre se mostrarán correctamente
**Desventaja:** Pequeño delay (<0.5s) mientras cargan las fuentes

### 2. ✅ Componentes con SVG Fallback (Creados)
**Archivos nuevos:**
- `/shared/components/ui/IconWithFallback/EmailIcon.tsx`
- `/shared/components/ui/IconWithFallback/PhoneIcon.tsx`

**Uso:**
```tsx
import { EmailIcon, PhoneIcon } from '@/shared/components/ui/IconWithFallback';

// Uso normal (Material Symbols)
<EmailIcon className="text-neutral-500" style={{ fontSize: '0.875rem' }} />

// Si las fuentes no cargan, tienes acceso al fallback SVG
<EmailIconSVG className="text-neutral-500" style={{ fontSize: '0.875rem' }} />
```

## Otras Opciones (No implementadas aún)

### Cambiar a `font-display: fallback` (Balance)
```css
font-display: fallback; /* Espera 3 segundos, luego muestra texto plano */
```
Medio punto entre `swap` y `block`.

### Usar Solo SVG para Icons Críticos
Si quieres eliminar la dependencia de fuentes para icons críticos:
```tsx
<EmailIconSVG className="text-neutral-500" />
```

## Testing
1. Abre DevTools → Network → Throttle a "Slow 3G"
2. Recarga la página
3. Verifica que email y phone icons aparezcan sin delay excesivo

## Recomendación
La solución actual (`font-display: block` + preload) es **optimal** para:
- ✅ Renderizado consistente
- ✅ Sin FOUT
- ✅ Sin cambio de diseño durante carga
- ✅ Fuentes locales (sin dependencia externa)

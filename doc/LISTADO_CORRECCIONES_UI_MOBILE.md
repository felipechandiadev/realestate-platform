# Listado de Correcciones de UI y Mobile (Portal, Backoffice y Design System)

> **Estado:** Documento de trabajo / Auditoría técnica  
> **Fecha:** 24 de Octubre de 2026  
> **Alcance:** `portal/` (sitio público), `backoffice/` (panel administrativo + PWA) y `packages/ui` (`@realestate/ui`, derivado de `kai-ui-web`)

---

## 📌 Origen de los Componentes y Distribución de Responsabilidades

Para mantener la coherencia de la arquitectura, dividimos las correcciones según el lugar donde deben implementarse:

```
                                  ARQUITECTURA DE UI
                                           │
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
       📦 kai-ui-web (Upstream)                        🏠 realEstatePlatform-3 (Local)
   Design System compartido base                    Lógica y vistas propias del producto
   ─────────────────────────────                    ────────────────────────────────────
   • Dialog (desborde ancho móvil)                  • Doble cabecera sticky (TopBar + NavBar)
   • TextField (zoom iOS + min-width)               • Ficha de propiedad (Sticky Contact Bar)
   • IconButton (touch targets 44px)                • MultimediaGrid (galería golden ratio)
   • DataGrid (modo responsive mobile)              • Slider hero (gestos touch swipe)
   • Safe area insets en overlays                   • SideBar backoffice (SPA router.push)
                                                    • TopBar padding excesivo en mobile
                                                    • KPICards tipografía fluida
                                                    • Bottom Navigation Bar (PWA admin)
```

---

## 📋 Resumen Ejecutivo y Matriz de Correcciones

| ID | Ubicación Canónica | Componente / Área | Problema | Severidad |
|:---|:---|:---|:---|:---:|
| **KAI-01** | `kai-ui-web` | `Dialog` | Ancho rígido inline (900px/800px) desborda la pantalla en móvil | 🔴 Crítico |
| **KAI-02** | `kai-ui-web` | `TextField` | Auto-zoom molesto en iOS Safari (`font-size: 14px < 16px`) | 🔴 Crítico |
| **KAI-03** | `kai-ui-web` | `TextField` | `min-width: 180px` forzado rompe formularios de 2 campos en móvil | 🔴 Crítico |
| **KAI-04** | `kai-ui-web` | `DataGrid` | Tablas sin vista móvil adaptativa (obliga a scroll bidireccional) | 🔴 Crítico |
| **KAI-05** | `kai-ui-web` | `IconButton` | Botones de 20px y 28px con touch targets inferiores a 44px (accesibilidad) | 🟡 Medio |
| **KAI-06** | `kai-ui-web` | `Tokens / Modales` | Falta de soporte de Safe Areas (`env(safe-area-inset-*)`) en overlays | 🟡 Medio |
| **APP-01** | `portal` | `layout.portal.tsx` | Doble cabecera sticky consume 25% del alto de pantalla en móvil | 🔴 Crítico |
| **APP-02** | `portal` | `PropertyDetailClient` | Ficha de propiedad sin barra fija inferior de contacto directo | 🟠 Alto |
| **APP-03** | `portal` | `MultimediaGrid` | Layout golden ratio (61.8%/38.2%) aplasta fotos secundarias en móvil | 🟠 Alto |
| **APP-04** | `portal` | `Slider.tsx` | Slider Hero carece de soporte táctil (swipe con dedo) | 🟡 Medio |
| **APP-05** | `portal` | `publish/page.tsx` | Retraso artificial innecesario de 3 segundos post-submit | 🟢 Bajo |
| **APP-06** | `portal` | `Wsp.tsx` | Botón WhatsApp colisiona con área de gestos de iOS | 🟡 Medio |
| **APP-07** | `backoffice` | `SideBar.tsx` | Menú lateral fuerza recarga completa con `window.location.href` | 🔴 Crítico |
| **APP-08** | `backoffice` | `TopBar.tsx` | Padding horizontal excesivo (`px-10` = 80px) comprime móvil | 🟠 Alto |
| **APP-09** | `backoffice` | `KPICards.tsx` | KPIs con tipografía fija gigante (`text-5xl`) desbordan cifras CLP | 🟠 Alto |
| **APP-10** | `backoffice` | `BackofficeShell` | PWA sin barra de navegación inferior (Bottom Navigation) | 🟡 Medio |
| **APP-11** | `portal/back` | `StepperBaseForm` | Filas de campos en formularios forzadas en horizontal sin wrap | 🟠 Alto |
| ~~PORTAL-02~~ | `portal` | `PropertyCard.tsx` | **Descartado / Diseñado así:** Abrir en nueva pestaña (`_blank`) es intencional | ⚪ N/A |

---

## 1. Cambios que Dependen de `kai-ui-web` (Design System Base)

Estos componentes residen en la librería de diseño compartida (`kai-ui-web` / `@kai/ui`). Corregirlos en `kai-ui-web` resuelve el problema tanto en **KAI Platform** (pwa-admin, KAI Store) como en **realEstatePlatform-3** (tras sincronizar `@realestate/ui`):

### [KAI-01] `Dialog`: Desborde horizontal en pantallas móviles
- **Componente:** `Dialog` (`Dialog.tsx` y `dialog.css`)
- **Causa raíz:** `buildWidthStyle()` inyecta `width: '900px'` o `'800px'` inline para presets `lg` y `md`. Al carecer de `max-width: calc(100vw - 2rem)` o `max-w-full`, en pantallas de 360–390px el modal se proyecta fuera de la pantalla.
- **Solución en `kai-ui-web`:**
  1. En `dialog.css` o en el componente `Dialog.tsx`, asegurar que `.fs-dialog__paper` siempre tenga:
     ```css
     max-width: calc(100vw - 2rem);
     width: 100%;
     ```
  2. En móvil (`< 640px`), ignorar anchos fijos de escritorio y adaptarse al 100% del contenedor con márgenes seguros.

### [KAI-02] `TextField`: Auto-zoom involuntario en iOS Safari
- **Componente:** `TextField` (`textfield.css`)
- **Causa raíz:** `.fs-text-field__input` tiene `font-size: 0.875rem` (14px). En iOS Safari, enfocar cualquier input con fuente < 16px fuerza un zoom automático que desconfigura la escala de la pantalla.
- **Solución en `kai-ui-web`:**
  1. Agregar media query en `textfield.css`:
     ```css
     @media (max-width: 768px) {
       .fs-text-field__input {
         font-size: 16px; /* 16px exactos previene el auto-zoom de iOS */
       }
     }
     ```

### [KAI-03] `TextField`: `min-width: 180px` rígido
- **Componente:** `TextField` (`textfield.css`)
- **Causa raíz:** `.fs-text-field__input` tiene `min-width: 180px;`. Al colocar dos inputs en fila (ej. "Dormitorios" y "Baños"), 180px + 180px = 360px + paddings > ancho de pantalla móvil, desbordando horizontalmente.
- **Solución en `kai-ui-web`:**
  1. Cambiar a `min-width: 0;` en `textfield.css` para permitir encogimiento elástico dentro de layouts flex y grid.

### [KAI-04] `DataGrid`: Modo adaptativo para móvil (Cards / Responsive Row)
- **Componente:** `DataGrid` (`DataGrid.tsx`, `Body.tsx`, `Header.tsx`)
- **Causa raíz:** `DataGrid` fue diseñado exclusivamente para escritorio con columnas de ancho fijo en píxeles. En celulares obliga a scroll horizontal en todas las tablas del sistema (contratos, clientes, usuarios, etc.).
- **Solución en `kai-ui-web`:**
  1. Incorporar soporte responsivo nativo en `DataGrid`: cuando el viewport sea `< md` (o vía prop `mobileView="cards"`), renderizar cada fila como una tarjeta vertical estructurada con los campos principales y el botón de acciones (`...`).

### [KAI-05] `IconButton`: Touch targets menores al estándar accesible
- **Componente:** `IconButton` (`IconButton.tsx` y `icon-button.css`)
- **Causa raíz:** Variantes `xs` (20×20px) y `sm` (28×28px) violan el estándar de 44×44px de Apple HIG y Google Material.
- **Solución en `kai-ui-web`:**
  1. En dispositivos táctiles (`useCoarsePointer`), agregar un pseudo-elemento transparente de mínimo 44×44px alrededor del icono para evitar toques erróneos.

### [KAI-06] Soporte de Safe Areas en overlays y diálogos
- **Componente:** `Dialog`, `Toast`, `tokens.css`
- **Solución en `kai-ui-web`:**
  1. Incorporar variables estándar `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` en modales, sheets y notificaciones.

---

## 2. Cambios Locales en `realEstatePlatform-3` (Portal y Backoffice)

Estos cambios son específicos del producto inmobiliario y **NO** dependen de `kai-ui-web`:

### [APP-01] Doble cabecera fija que consume el viewport en móvil
- **Ubicación:** `portal/app/layout.portal.tsx` y `portal/app/ui/NavBar.tsx`
- **Problema:** En móviles, `PortalTopBar` + `NavBar` + `StickyFilterButton` fijos ocupan más de 135px en la parte superior. Al mismo tiempo se muestra el menú hamburguesa y debajo un menú horizontal con links cortados.
- **Corrección local:**
  1. Ocultar `NavBar` horizontal en `< md` (`hidden md:block`).
  2. Centralizar toda la navegación en el Drawer lateral (`Sidebar`) que ya abre el botón hamburguesa del `PortalTopBar`.

### [NOTA-01] Comportamiento en Tarjetas de Propiedades (`PropertyCard`)
- **Ubicación:** `portal/app/ui/PropertyCard.tsx` (`window.open('_blank')`)
- **Definición de negocio:** **Diseñado intencionalmente así.** Abrir en nueva pestaña permite al usuario comparar múltiples propiedades simultáneamente sin perder su posición ni filtros en el listado principal. **No se modifica.**

### [APP-02] Falta de "Sticky Bottom Contact Bar" en la Ficha de Propiedad
- **Ubicación:** `portal/app/properties/property/[id]/PropertyDetailClient.tsx`
- **Problema:** El formulario de contacto se encuentra al final de la página. En móvil el usuario debe scrollear más de 2.000px pasando fotos, detalles y mapa para poder contactar.
- **Corrección local:**
  1. Crear barra fija inferior en mobile (`md:hidden fixed bottom-0 z-40 bg-background/95 backdrop-blur border-t p-3`):
     - Botón directo a WhatsApp con el agente asignado.
     - Botón de llamada telefónica directa.
     - Botón para abrir modal de consulta rápida.

### [APP-03] MultimediaGrid con diseño rígido que aplasta imágenes en móvil
- **Ubicación:** `portal/app/properties/property/[id]/MultimediaGrid.tsx`
- **Problema:** Las proporciones golden ratio (61.8% y 38.2%) reducen las fotos secundarias a franjas de ~135px en teléfonos.
- **Corrección local:**
  1. En móvil (`< md`), renderizar carrusel táctil de ancho completo con indicador flotante (`1 / N`).

### [APP-04] Hero Slider sin gestos táctiles (Swipe)
- **Ubicación:** `portal/app/ui/Slider.tsx`
- **Problema:** Solo avanza por tiempo o pulsando flechas pequeñas; carece de eventos `onTouchStart` / `onTouchEnd`.
- **Corrección local:**
  1. Agregar gestos táctiles para deslizar slides con el dedo en pantallas táctiles.

### [APP-05] Retraso artificial de 3 segundos al publicar
- **Ubicación:** `portal/app/publish/page.tsx` (`setTimeout(..., 3000)`)
- **Corrección local:** Eliminar el timeout y avanzar de inmediato tras la confirmación del backend.

### [APP-06] Botón flotante WhatsApp (`Wsp.tsx`)
- **Ubicación:** `portal/app/ui/Wsp.tsx`
- **Corrección local:** Ajustar posición para respetar la barra de navegación de iOS y ocultar en la ficha de propiedad si la barra de contacto ya tiene acceso a WhatsApp.

### [APP-07] Recarga forzada de página en el menú lateral del Backoffice
- **Ubicación:** `backoffice/shared/components/ui/TopBar/SideBar.tsx` (`window.location.href = url;`)
- **Problema:** Destruye la experiencia SPA y causa parpadeos blancos en conexiones móviles.
- **Corrección local:**
  1. Reemplazar por navegación controlada con `router.push(url)` de Next.js.

### [APP-08] Padding excesivo en la cabecera del Backoffice
- **Ubicación:** `backoffice/shared/components/ui/TopBar/TopBar.tsx` (`px-10`)
- **Problema:** 80px de padding horizontal comprimen el título y los botones en pantallas de 360–390px.
- **Corrección local:** Cambiar a `px-3 sm:px-6 md:px-10`.

### [APP-09] Tipografía fija gigante en KPIs del Dashboard
- **Ubicación:** `backoffice/app/components/KPICards.tsx` (`text-5xl font-bold`)
- **Problema:** Cifras en CLP se desbordan o parten en dos líneas en móvil.
- **Corrección local:** Usar tipografía responsiva `text-2xl sm:text-3xl lg:text-5xl font-bold`.

### [APP-10] PWA sin Bottom Navigation Bar en Backoffice
- **Ubicación:** `backoffice/app/BackofficeShell.tsx`
- **Problema:** El panel admin se usa como PWA en celular pero requiere abrir el menú hamburguesa superior para cualquier acción.
- **Corrección local:**
  1. Añadir barra inferior fija con accesos rápidos: Dashboard, Propiedades, Contratos, Notificaciones y Menú.

### [APP-11] Filas rígidas en Wizards y Formularios Base
- **Ubicación:** `portal/shared/components/ui/BaseForm/StepperBaseForm.tsx` y `backoffice/src/features/properties/components/dialogs/createProperty/CreatePropertyStepFields.tsx`
- **Problema:** Contenedores con `flex items-start gap-2` aplastan inputs en móvil.
- **Corrección local:** Cambiar a `flex flex-col sm:flex-row w-full items-start gap-3`.

---

## 3. Checklist de Ejecución

### Grupo A: En el repositorio `kai-ui-web`
- [ ] **[KAI-01]** `Dialog`: Agregar `max-w-[calc(100vw-2rem)]` y ancho elástico en móvil.
- [ ] **[KAI-02]** `TextField`: Configurar `font-size: 16px` en `@media (max-width: 768px)` en `textfield.css`.
- [ ] **[KAI-03]** `TextField`: Cambiar `min-width: 180px` a `min-width: 0;`.
- [ ] **[KAI-04]** `DataGrid`: Diseñar modo móvil automático (cards / vista adaptativa).
- [ ] **[KAI-05]** `IconButton`: Garantizar área táctil mínima de 44×44px en pantallas touch.
- [ ] **[KAI-06]** `Tokens/Dialog`: Incorporar `env(safe-area-inset-*)`.
- [ ] **Sincronización:** Actualizar `@realestate/ui` desde `kai-ui-web` tras aplicar los cambios.

### Grupo B: En este repositorio (`realEstatePlatform-3`)
- [ ] **[APP-07]** Reemplazar `window.location.href` por `router.push` en `SideBar.tsx`.
- [ ] **[APP-08]** Reducir padding de `TopBar.tsx` (`px-10` → `px-3 sm:px-6`).
- [ ] **[APP-09]** Ajustar tipografía fluida en `KPICards.tsx`.
- [ ] **[APP-11]** Convertir filas de wizards a `flex-col sm:flex-row` en `StepperBaseForm.tsx` y `CreatePropertyStepFields.tsx`.
- [ ] **[APP-01]** Ocultar `NavBar` en móvil (`hidden md:block`) y centralizar en Drawer.
- [ ] **[APP-02]** Implementar `StickyPropertyContactBar` móvil en la ficha de propiedad.
- [ ] **[APP-03]** Carrusel táctil de ancho completo para `MultimediaGrid` en móvil.
- [ ] **[APP-04]** Añadir gestos swipe en `Slider.tsx`.
- [ ] **[APP-05]** Quitar timeout artificial de 3 segundos en `publish/page.tsx`.
- [ ] **[APP-10]** Diseñar Bottom Navigation Bar para la PWA de Backoffice.

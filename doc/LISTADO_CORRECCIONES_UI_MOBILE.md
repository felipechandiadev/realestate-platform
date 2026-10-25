# Listado de Correcciones de UI y Mobile (Portal, Backoffice y Design System)

> **Estado:** Documento de trabajo / Auditoría técnica (revisado contra el código el 24-10-2026)  
> **Fecha:** 24 de Octubre de 2026  
> **Alcance:** `portal/` (sitio público), `backoffice/` (panel administrativo + PWA) y `packages/ui` (`@realestate/ui`, derivado de `kai-ui-web`)

---

## 📌 Origen de los Componentes y Distribución de Responsabilidades

Para mantener la coherencia de la arquitectura, dividimos las correcciones según el lugar donde deben implementarse.

> **⚠️ Estrategia upstream (revisado 24-10-2026):** `packages/ui` (`@realestate/ui`) **no se sincroniza** desde `kai-ui-web`: es una base adaptada que ya divergió (ver `packages/ui/README.md` e `INVENTORY.md`; p. ej. LocationPicker es canónico del portal, y TextField/Select/Dialog tienen props locales `error`/`description`). No existe script de sincronización.
>
> - **Fuente de verdad para este producto:** corregir en `packages/ui`.
> - **`kai-ui-web`:** portar los cambios como contribución opcional para KAI Platform, **nunca** sobrescribir `packages/ui` desde upstream (perdería los cambios locales).

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

| ID | Ubicación Canónica | Componente / Área | Problema | Severidad | Estado |
|:---|:---|:---|:---|:---:|:---|
| **KAI-01** | `packages/ui` (port a `kai-ui-web`) | `Dialog` | Ancho rígido inline (900px/800px) desborda la pantalla en móvil | 🔴 Crítico | ⚠️ Parcial (local) |
| **KAI-02** | `packages/ui` (port a `kai-ui-web`) | `TextField` | Auto-zoom molesto en iOS Safari (`font-size: 14px < 16px`) | 🔴 Crítico | ✅ Hecho (local) |
| **KAI-03** | `packages/ui` (port a `kai-ui-web`) | `TextField` | `min-width: 180px` forzado rompe formularios de 2 campos en móvil | 🔴 Crítico | ✅ Hecho |
| **KAI-04** | `packages/ui` (port a `kai-ui-web`) | `DataGrid` | Tablas sin vista móvil adaptativa (obliga a scroll bidireccional) | 🔴 Crítico | Pendiente |
| **KAI-05** | `packages/ui` (port a `kai-ui-web`) | `IconButton` | Botones de 20px y 28px con touch targets inferiores a 44px (accesibilidad) | 🟡 Medio | Pendiente |
| **KAI-06** | `packages/ui` (port a `kai-ui-web`) | `Tokens / Modales` | Falta de soporte de Safe Areas (`env(safe-area-inset-*)`) en overlays | 🟡 Medio | ⚠️ Parcial (Toast) |
| **APP-01** | `portal` | `layout.portal.tsx` | Doble cabecera sticky consume 25% del alto de pantalla en móvil | 🔴 Crítico | ✅ Hecho |
| **APP-02** | `portal` | `PropertyDetailClient` | Ficha de propiedad sin barra fija inferior de contacto directo | 🟠 Alto | Pendiente |
| **APP-03** | `portal` | `MultimediaGrid` | Layout golden ratio (61.8%/38.2%) aplasta fotos secundarias en móvil | 🟠 Alto | Pendiente |
| **APP-04** | `portal` | `Slider.tsx` | Slider Hero carece de soporte táctil (swipe con dedo) | 🟡 Medio | Pendiente |
| **APP-05** | `portal` | `publish/page.tsx` | Retraso artificial innecesario de 3 segundos post-submit | 🟢 Bajo | ✅ Hecho |
| **APP-06** | `portal` | `Wsp.tsx` | Botón WhatsApp colisiona con área de gestos de iOS | 🟡 Medio | Pendiente |
| **APP-07** | `backoffice` | `SideBar.tsx` | Menú lateral fuerza recarga completa con `window.location.href` | 🟠 Alto | ✅ Hecho |
| **APP-08** | `backoffice` | `TopBar.tsx` | Padding horizontal excesivo (`px-10` = 80px) comprime móvil | 🟠 Alto | ✅ Hecho |
| **APP-09** | `backoffice` | `KPICards.tsx` | KPIs con tipografía fija gigante (`text-5xl`) desbordan cifras CLP | 🟠 Alto | ✅ Hecho |
| **APP-10** | `backoffice` | `BackofficeShell` | PWA sin barra de navegación inferior (Bottom Navigation) | 🟡 Medio | Pendiente |
| **APP-11** | `portal/back` | `StepperBaseForm` | Filas de campos en formularios forzadas en horizontal sin wrap | 🟠 Alto | ✅ Hecho |
| **APP-12** | `portal` | `PropertyDetailClient` | Descripción con texto justificado deja huecos grandes en móvil | 🟡 Medio | ✅ Hecho |
| **APP-13** | `portal` | `PropertyDetailClient` | Formulario de contacto no se precarga con los datos del usuario logueado | 🟡 Medio | Pendiente |
| **APP-14** | `portal/back` | Imágenes / `LazyImage` | Imágenes originales pesadas (~2,8 MB) tardan en mostrarse en galería y artículos | 🟠 Alto | Pendiente |
| **APP-15** | `portal` | Filtro clásico | Filtro clásico sticky (3 filas) + cabecera ocupan ~1/3 de la pantalla | 🟠 Alto | Pendiente |
| **APP-16** | `portal` | `PortalFooter.tsx` | Botón "FAQs" visible aunque no haya preguntas configuradas | 🟢 Bajo | ✅ Hecho |
| **APP-17** | `portal` | Menú lateral / sesión | Drawer sin fondo oscurecido y saludo con nombre desactualizado (la sesión no se refresca al editar el perfil) | 🟢 Bajo | Pendiente |
| ~~PORTAL-02~~ | `portal` | `PropertyCard.tsx` | **Descartado / Diseñado así:** Abrir en nueva pestaña (`_blank`) es intencional | ⚪ N/A | — |

---

## 1. Cambios en el Design System (`packages/ui`, con port opcional a `kai-ui-web`)

Estos componentes viven en `packages/ui` (`@realestate/ui`). Se corrigen **aquí** y, si interesa a KAI Platform (pwa-admin, KAI Store), se portan a `kai-ui-web`. Ver la nota de estrategia upstream al inicio: no se sincroniza `packages/ui` desde upstream.

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
- **Estado (24-10-2026): ⚠️ Parcial, aplicado en `packages/ui` (commit `9154bc4`).** `dialog.css` y `Dialog.tsx` limitan a `calc(100vw - 2rem)`, pero **solo si no se pasa `maxWidth`**; además `minWidth` puede seguir desbordando. Hoy ningún diálogo pasa esas props, pero falta envolverlas en `min(<valor>, calc(100vw - 2rem))`.

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
- **Estado (24-10-2026): ✅ Hecho en `packages/ui`** (commit `9154bc4`). Pendiente solo el port a `kai-ui-web`.

### [KAI-03] `TextField`: `min-width: 180px` rígido
- **Componente:** `TextField` (`textfield.css`)
- **Causa raíz:** `.fs-text-field__input` tiene `min-width: 180px;`. Al colocar dos inputs en fila (ej. "Dormitorios" y "Baños"), 180px + 180px = 360px + paddings > ancho de pantalla móvil, desbordando horizontalmente.
- **Solución en `kai-ui-web`:**
  1. Cambiar a `min-width: 0;` en `textfield.css` para permitir encogimiento elástico dentro de layouts flex y grid.
- **Estado (24-10-2026): ❌ Aplicado pero sin efecto.** `textfield.css` ya tiene `min-width: 0`, pero `TextField.tsx` (líneas ~678 y ~719) sigue agregando la clase Tailwind `min-w-[180px]` cuando no es `compact`. Como las apps importan el CSS de componentes **antes** de `@tailwind utilities`, la utilidad de 180px gana.
  - **Corrección real:** reemplazar `min-w-[180px]` por `min-w-0` (o `min-w-0 sm:min-w-[180px]` si se quiere conservar en escritorio) en `TextField.tsx`.

### [KAI-04] `DataGrid`: Modo adaptativo para móvil (Cards / Responsive Row)
- **Componente:** `DataGrid` (`DataGrid.tsx`, `Body.tsx`, `Header.tsx`)
- **Causa raíz:** `DataGrid` fue diseñado exclusivamente para escritorio con columnas de ancho fijo en píxeles. En celulares obliga a scroll horizontal en todas las tablas del sistema (contratos, clientes, usuarios, etc.).
- **Solución en `kai-ui-web`:**
  1. Incorporar soporte responsivo nativo en `DataGrid`: cuando el viewport sea `< md` (o vía prop `mobileView="cards"`), renderizar cada fila como una tarjeta vertical estructurada con los campos principales y el botón de acciones (`...`).
- **Nota:** `DataGrid.tsx` ya calcula `isMobile` (`useScreenSize`) pero no lo usa. Y `packages/ui` ya tiene `CollectionGrid` (tarjetas + header + paginación): conviene **reutilizarlo** como vista móvil en vez de construir un modo nuevo desde cero.

### [KAI-05] `IconButton`: Touch targets menores al estándar accesible
- **Componente:** `IconButton` (`IconButton.tsx` y `icon-button.css`)
- **Causa raíz:** Variantes `xs` (20×20px) y `sm` (28×28px) violan el estándar de 44×44px de Apple HIG y Google Material.
- **Solución en `kai-ui-web`:**
  1. En dispositivos táctiles (`useCoarsePointer`), agregar un pseudo-elemento transparente de mínimo 44×44px alrededor del icono para evitar toques erróneos.

### [KAI-06] Soporte de Safe Areas en overlays y diálogos
- **Componente:** `Dialog`, `Toast`, `tokens.css`
- **Solución en `kai-ui-web`:**
  1. Incorporar variables estándar `env(safe-area-inset-top)` y `env(safe-area-inset-bottom)` en modales, sheets y notificaciones.
- **Estado:** ⚠️ Parcial. `Toast` ya usa `env(safe-area-inset-top)` (`toast.css`). Falta en `Dialog`, drawers y en el botón flotante de WhatsApp (APP-06).

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
- **Matiz:** el comentario del código indica que la recarga es intencional "para mostrar `loading.tsx`". En App Router, `router.push` **también** muestra los `loading.tsx` de la ruta destino, así que el cambio sigue siendo válido. Severidad ajustada de 🔴 a 🟠.

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

### [APP-12] Descripción justificada en la ficha
- **Ubicación:** `portal/app/properties/property/[id]/PropertyDetailClient.tsx`
- **Problema:** `text-justify` en columnas de ~340px genera "ríos" de espacio entre palabras.
- **Corrección local:** usar alineación a la izquierda en móvil (`text-left md:text-justify`, o directamente `text-left`).

### [APP-13] Formulario de contacto sin precarga
- **Ubicación:** `portal/app/properties/property/[id]/PropertyDetailClient.tsx`
- **Problema:** con sesión iniciada, nombre, correo y teléfono aparecen vacíos.
- **Corrección local:** precargar desde `useAuth()` (`name`, `email`, `phone`; este último ya llega en la sesión desde el commit `8c51641`). Combina bien con APP-02.

### [APP-14] Imágenes pesadas sin variante optimizada
- **Ubicación:** galería de la ficha, tarjetas de artículos del backoffice (`LazyImage`).
- **Problema:** se sirven originales de ~2,8 MB; en móvil quedan grises varios segundos.
- **Corrección local:** usar las variantes (`thumbnail-*`, webp) que ya genera el módulo de media cuando existan, y `sizes` correctos en `next/image`. Revisar que el seed y las subidas generen variantes.

### [APP-15] Filtro clásico sticky demasiado alto en móvil
- **Ubicación:** variante `classic` del listado (home / venta / arriendo con CMS en "Filtro clásico").
- **Problema:** las 3 filas de selects quedan fijas bajo la cabecera; junto con APP-01 ocupan ~1/3 del alto.
- **Corrección local:** en móvil, colapsar a un botón "Filtros" (como en `sidebar_v2`) o no fijarlo. Si el CMS usa `sidebar_v2`, este punto no aplica.

### [APP-16] Botón "FAQs" sin preguntas
- **Ubicación:** `portal/app/ui/PortalFooter.tsx`
- **Aclaración:** "FAQs" es un botón que abre un diálogo con las preguntas de *Identidad*; no es un título vacío. El problema real era mostrarlo aunque no hubiera preguntas (el diálogo decía "No hay preguntas frecuentes disponibles").
- **Corrección local (hecha):** el botón solo se muestra si `footer.showFaqs` y hay al menos una pregunta.

### [APP-17] Drawer del portal
- **Problema:** no oscurece el contenido de fondo, y el saludo usa el nombre de la sesión, que no se actualiza tras editar "Mis datos".
- **Corrección local:** agregar backdrop (`bg-black/40`) que cierre al tocar; tras guardar el perfil, refrescar la sesión (`update()` de `next-auth`) o leer el nombre del perfil.

---

## 3. Checklist de Ejecución

### Grupo A: En `packages/ui` (luego port opcional a `kai-ui-web`)
- [~] **[KAI-01]** `Dialog`: limitar ancho en móvil. *Hecho para el caso por defecto; falta aplicar el límite también cuando se pasan `maxWidth`/`minWidth`.*
- [x] **[KAI-02]** `TextField`: `font-size: 16px` en `@media (max-width: 768px)` (commit `9154bc4`).
- [x] **[KAI-03]** `TextField`: el CSS ya tiene `min-width: 0`, **falta** quitar `min-w-[180px]` en `TextField.tsx`.
- [ ] **[KAI-04]** `DataGrid`: vista móvil reutilizando `CollectionGrid`.
- [ ] **[KAI-05]** `IconButton`: área táctil mínima de 44×44px en pantallas touch.
- [~] **[KAI-06]** Safe areas: ya en `Toast`; falta `Dialog`, drawers y botón WhatsApp.
- [ ] **Port a `kai-ui-web`:** llevar los cambios aplicados como contribución upstream. **No** sobrescribir `packages/ui` desde upstream.

### Grupo B: En este repositorio (`realEstatePlatform-3`)
- [x] **[APP-07]** Reemplazar `window.location.href` por `router.push` en `SideBar.tsx`.
- [x] **[APP-08]** Reducir padding de `TopBar.tsx` (`px-10` → `px-3 sm:px-6`).
- [x] **[APP-09]** Ajustar tipografía fluida en `KPICards.tsx`.
- [x] **[APP-11]** Convertir filas de wizards a `flex-col sm:flex-row` en `StepperBaseForm.tsx` y `CreatePropertyStepFields.tsx`.
- [x] **[APP-01]** Ocultar `NavBar` en móvil (`hidden md:block`) y centralizar en Drawer.
- [ ] **[APP-02]** Implementar `StickyPropertyContactBar` móvil en la ficha de propiedad.
- [ ] **[APP-03]** Carrusel táctil de ancho completo para `MultimediaGrid` en móvil.
- [ ] **[APP-04]** Añadir gestos swipe en `Slider.tsx`.
- [x] **[APP-05]** Quitar timeout artificial de 3 segundos en `publish/page.tsx`.
- [ ] **[APP-10]** Diseñar Bottom Navigation Bar para la PWA de Backoffice.
- [x] **[APP-12]** Descripción de la ficha con `text-left` en móvil.
- [ ] **[APP-13]** Precargar el formulario de contacto con los datos del usuario.
- [ ] **[APP-14]** Servir variantes optimizadas de imagen en galería y artículos.
- [ ] **[APP-15]** Colapsar el filtro clásico en móvil (o usar `sidebar_v2`).
- [x] **[APP-16]** Ocultar "FAQs" vacío en el footer.
- [ ] **[APP-17]** Backdrop en el drawer y refresco del nombre en sesión.

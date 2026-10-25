# 03 · Funcionalidades del portal público

URL: https://bravoshottpropiedades.cl · Código: `portal/` (Next.js, App Router)

## 3.1 Estructura general

- **Barra superior** (logo, valor UF del día, ingreso/cuenta) y **menú de navegación** editable desde el CMS. En móvil, el menú se abre como panel lateral.
- **Pie de página** editable (contacto, redes, enlaces).
- **Botón de WhatsApp** flotante.

## 3.2 Páginas y rutas

| Ruta | Función |
|---|---|
| `/` | Portada: slider, filtro de búsqueda, propiedades destacadas (solo si existen), listado y testimonios |
| `/properties/sale` · `/properties/rent` | Listados de venta y arriendo con filtros |
| `/properties/property/[id]` | Ficha: galería, precio (CLP/UF), características, mapa, agente, formulario de interés, compartir |
| `/favorites` | Propiedades guardadas |
| `/publish` | Publicar una propiedad (formulario por pasos) |
| `/sell-property` · `/rent-property` | Solicitar venta o arriendo a la corredora |
| `/valuation` | Solicitar tasación / estimación de valor |
| `/aboutUs` · `/ourTeam` · `/services` · `/testimonials` | Institucionales |
| `/blog` | Artículos publicados desde el CMS |
| `/privacidad` | Política de privacidad |
| `/forgot-password` · `/reset-password` · `/verify-email` | Flujos de cuenta |
| `/personalInfo` | Mis datos |
| `/myProperties` | Mis propiedades (solicitudes y su estado) |
| `/myContracts` · `/myContracts/[id]/payments` | Mis contratos y sus pagos |
| `/notifications` | Notificaciones del cliente |

## 3.3 Búsqueda y filtros

El tipo de filtro se configura en *Backoffice → CMS → Listados*:

| Variante | Escritorio | Móvil |
|---|---|---|
| **Clásico** (`classic`) | Barra horizontal sobre la grilla | Selectores apilados |
| **Sidebar v2** (`sidebar_v2`) | Barra lateral con filtros avanzados | Botón "Filtrar" que abre un panel con el total en vivo ("Ver N propiedades") |

Filtros disponibles: operación, tipo de propiedad, región, comuna, moneda, rango de precio, superficie, dormitorios, baños y otras características. Los filtros se reflejan en la URL, así que una búsqueda se puede compartir. La configuración se cachea 5 minutos en el portal.

## 3.4 Captación y leads

| Acción del visitante | Resultado |
|---|---|
| Formulario de interés en una ficha | Notificación y correo al admin y al agente asignado; correo de confirmación al visitante |
| Publicar / vender / arrendar | Propiedad creada con estado `REQUEST` y aviso a los administradores |
| Tasación | Solicitud registrada y estimación orientativa basada en reglas |
| Contacto | Aviso a los administradores |

## 3.5 SEO y rendimiento

- Renderizado en servidor, metadatos por ficha (editables en la sección SEO de la propiedad).
- `sitemap.xml` y `robots.txt` generados automáticamente.
- Imágenes optimizadas (variantes generadas con Sharp, servidas desde R2 vía `next/image`).

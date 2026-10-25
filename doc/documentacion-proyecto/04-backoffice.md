# 04 · Funcionalidades del backoffice

URL: https://admin.bravoshottpropiedades.cl · Código: `backoffice/` (Next.js + PWA instalable)

## 4.1 Módulos

| Módulo | Ruta | Contenido |
|---|---|---|
| Dashboard | `/` | KPIs, distribución de propiedades, ingresos, comparación y ranking de agentes |
| Propiedades en venta / arriendo | `/properties/sales` · `/properties/rent` | Grilla con filtros y ficha por secciones |
| Tipos de propiedad | `/properties/propertyTypes` | Casa, departamento, oficina, etc. |
| Contratos de venta / arriendo | `/contracts/sales` · `/contracts/rent` | Contratos con partes, montos, pagos y documentos |
| Personas | `/contracts/persons` | Fichas de personas que participan en contratos |
| Documentos y tipos | `/contracts/documents` · `/contracts/documentTypes` | Carga y clasificación de documentos (incluido DNI) |
| Usuarios | `/users/administrators` · `/users/agents` · `/users/community` | Alta, edición y estado |
| CMS | `/cms/*` | Contenido del portal (ver 4.3) |
| Notificaciones | `/notifications` | Avisos internos (leads, solicitudes, cambios) |
| Reportes | `/reports` | Solo administradores |

## 4.2 Ficha de propiedad

Se edita por secciones que guardan de forma independiente:

1. **Información básica**: título, operación, tipo, precio y moneda (CLP/UF), estado, agente asignado.
2. **Características**: superficies, dormitorios, baños, estacionamientos y otros atributos.
3. **Ubicación**: región, comuna, dirección y punto en el mapa.
4. **Multimedia**: fotos y videos; se generan variantes optimizadas.
5. **SEO y marketing**: título y descripción para buscadores, destacada en portada.
6. **Notas internas**: solo visibles para el equipo.
7. **Historial**: cambios registrados (auditoría).

## 4.3 CMS

| Sección | Qué controla en el portal |
|---|---|
| Identidad | Nombre, logo, contacto, redes, alianzas y preguntas frecuentes |
| Apariencia | Colores y plantilla visual |
| Barra superior | Menú y enlaces del encabezado |
| Pie de página | Contenido del footer |
| Slider | Imágenes y textos de la portada |
| Destacadas | Configuración de propiedades destacadas |
| Listados | Variante de filtro (clásico / sidebar v2) |
| Nosotros · Equipo · Testimonios · Artículos | Páginas institucionales y blog |

## 4.4 PWA

El backoffice se puede instalar en el celular o el escritorio ("Agregar a pantalla de inicio"). Incluye una página sin conexión (`/~offline`).

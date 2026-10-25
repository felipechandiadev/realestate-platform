# 01 · Visión general y objetivos

## 1.1 Qué es

Una plataforma web propia para la corredora **Bravo Shott Propiedades**, que reúne en un solo sistema:

1. **La vitrina pública** (portal): donde los visitantes buscan, ven y consultan propiedades en venta y arriendo, y donde los propietarios ofrecen las suyas.
2. **La operación interna** (backoffice): donde administradores y agentes gestionan propiedades, clientes, contratos, pagos, documentos y el contenido del sitio.
3. **El cerebro central** (API): un servicio que guarda los datos, valida permisos, envía correos y almacena archivos.

## 1.2 Problema que resuelve

| Antes (situación típica) | Con la plataforma |
|---|---|
| Propiedades publicadas solo en portales de terceros | Sitio propio con marca, SEO y datos de contacto directos |
| Captación de propiedades por teléfono o correo suelto | Formularios de venta, arriendo y tasación que crean una solicitud trazable |
| Contratos y pagos en planillas | Contratos de venta y arriendo con partes, documentos y pagos registrados |
| Cambios del sitio dependen de un programador | CMS: el equipo edita portada, menú, equipo, testimonios, blog e identidad |
| Sin visibilidad del rendimiento | Dashboard con KPIs, ranking de agentes y reportes |

## 1.3 Objetivos

**Objetivos de negocio**
- Generar **leads propios** (interés en propiedades, contacto, solicitudes de publicación).
- **Captar propiedades** de propietarios mediante el portal.
- Dar al cliente final un **área privada**: sus propiedades, contratos, pagos y notificaciones.
- **Ordenar la operación**: estados de propiedad, asignación de agente, contratos y pagos en un solo lugar.
- **Autonomía editorial** sin depender de desarrollo.

**Objetivos técnicos**
- Separar responsabilidades: los frontends nunca tocan la base de datos; todo pasa por la API.
- Sitio rápido y posicionable (renderizado en servidor, imágenes optimizadas, sitemap y robots).
- Backoffice instalable como **PWA** en celular.
- Código tipado, con lint y pruebas automáticas en CI.

## 1.4 Alcance resumido

- Portal: portada, búsqueda con filtros, listados de venta y arriendo, ficha, favoritos, publicar / vender / arrendar / tasar, institucionales, blog, cuenta de cliente.
- Backoffice: dashboard, propiedades, tipos de propiedad, contratos, personas, documentos, usuarios, CMS, notificaciones, reportes.
- API: autenticación, usuarios, propiedades, multimedia, contratos, pagos, documentos, CMS, notificaciones, correo, auditoría, analítica y estimación de valor.

Lo que **no** incluye (ver [Acta §6](../ACTA_DE_ENTREGA.md)): apps nativas, pasarela de pago, integración con portales externos, carga masiva de catálogo, modo oscuro.

# Documentación del proyecto — Plataforma inmobiliaria Bravo Shott Propiedades

Documentación integral para la entrega al cliente. Explica qué es la plataforma, para qué sirve, cómo está construida, cómo se opera y cómo se mantiene.

> Este conjunto **no contiene secretos**. Contraseñas, API keys y cadenas de conexión viven en los archivos de entorno del servidor y en las cuentas de cada proveedor.

## Índice

| # | Sección | Para quién |
|---|---|---|
| 01 | [Visión general y objetivos](./01-vision-general.md) | Cliente, gerencia |
| 02 | [Usuarios, roles y permisos](./02-usuarios-y-roles.md) | Cliente, administradores |
| 03 | [Funcionalidades del portal público](./03-portal.md) | Cliente, equipo comercial |
| 04 | [Funcionalidades del backoffice](./04-backoffice.md) | Administradores, agentes |
| 05 | [Procesos de negocio y ciclos de vida](./05-procesos-de-negocio.md) | Cliente, operación |
| 06 | [Arquitectura técnica](./06-arquitectura.md) | Equipo técnico |
| 07 | [Modelo de datos](./07-modelo-de-datos.md) | Equipo técnico |
| 08 | [Integraciones y servicios externos](./08-integraciones.md) | Cliente, equipo técnico |
| 09 | [Infraestructura, despliegue y operación](./09-despliegue-y-operacion.md) | Equipo técnico |
| 10 | [Desarrollo local, calidad y pruebas](./10-desarrollo-y-calidad.md) | Equipo técnico |
| 11 | [Seguridad](./11-seguridad.md) | Cliente, equipo técnico |
| 12 | [Mantenimiento, limitaciones y hoja de ruta](./12-mantenimiento-y-roadmap.md) | Cliente, equipo técnico |
| 13 | [Glosario](./13-glosario.md) | Todos |

## Documentos relacionados

- [Acta de entrega](../ACTA_DE_ENTREGA.md) — alcance formal, garantía y conformidad.
- [Manual de usuario](../manual-de-usuario/MANUAL_DE_USUARIO.md) — uso paso a paso de pantallas.
- [Correo transaccional](../CORREO_TRANSACCIONAL.md) — Resend, credenciales y límites del plan.
- [Roadmap de mejoras](../ROADMAP_MEJORAS.md) — evolución sugerida.
- [Correcciones UI móvil](../LISTADO_CORRECCIONES_UI_MOBILE.md) — estado de la interfaz móvil.

## Datos rápidos

| | |
|---|---|
| Portal | https://bravoshottpropiedades.cl |
| Backoffice | https://admin.bravoshottpropiedades.cl |
| API | https://core.bravoshottpropiedades.cl/api |
| Repositorio | `felipechandiadev/realestate-platform`, rama `main` |
| Stack | Next.js 16 + React 19 (frontends), NestJS 11 + TypeORM + MySQL 8 (API) |
| Archivos | Cloudflare R2 |
| Correo | Resend (SMTP) |
| Hosting | VPS con nginx + PM2 + Let's Encrypt |

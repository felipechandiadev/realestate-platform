# Acta de entrega

**Proyecto:** Plataforma inmobiliaria Bravo Shott Propiedades  
**Producto entregado:** portal público, backoffice y API  
**Fecha de entrega:** 25 de septiembre de 2026  
**Ambiente de aceptación:** producción en el servidor del cliente  
**Estado:** entregado y en operación

Esta acta deja constancia de que el sistema descrito aquí está desplegado, accesible y habilitado para su uso operativo. Con la firma de las partes comienza el período de garantía sobre el alcance entregado.

---

## 1. Objeto

Se entrega la plataforma web para la operación comercial y editorial de Bravo Shott Propiedades. El alcance incluye tres aplicaciones que trabajan sobre una misma base de datos y un mismo almacenamiento de archivos:

| Aplicación | Dirección | Uso |
|---|---|---|
| Portal | https://bravoshottpropiedades.cl | Sitio público y área de clientes de la comunidad |
| Backoffice | https://admin.bravoshottpropiedades.cl | Operación interna de agentes y administradores |
| API | https://core.bravoshottpropiedades.cl | Servicio que concentra datos, autenticación, correo y archivos |

El portal y el backoffice no acceden a la base de datos. Toda persistencia, autorización de negocio y almacenamiento de medios pasa por la API.

## 2. Línea base entregada

La línea base es el sistema que está corriendo en producción en la fecha de esta acta. El repositorio de referencia es `felipechandiadev/realestate-platform`, rama `main`. El último commit publicado en el remoto es `7cd3153`. Sobre esa base, el servidor de producción incluye los ajustes ya aplicados en el ambiente vivo: tema claro fijo, guardado por secciones de la identidad de empresa, guardado de SEO y marketing de una propiedad, y ocultamiento de “Propiedades destacadas” cuando no hay ninguna destacada publicada.

Las credenciales de base de datos, correo, almacenamiento y sesión no forman parte de este documento. Viven en los archivos de entorno del servidor y no se versionan.

## 3. Arquitectura

### 3.1 Aplicaciones

Monorepo con tres procesos de aplicación y un paquete de interfaz compartido.

- **API (`core`).** NestJS 11, TypeORM 0.3 y conector MySQL. Expone la API REST, la documentación Swagger, la autenticación JWT y los casos de uso de negocio. Corre en el puerto interno `8000`.
- **Portal.** Next.js 16 (App Router) y React 19. Sitio público y flujos del usuario de comunidad. Puerto interno `8001`.
- **Backoffice.** Next.js 16 y React 19. Operación de venta, arriendo, contratos, personas, documentos y CMS. Puerto interno `8002`.
- **Interfaz compartida (`packages/ui`).** Componentes y tokens visuales usados por portal y backoffice. El tema queda fijado a esquema de color claro: la interfaz no sigue el modo oscuro del dispositivo.

La sesión de los frontends la resuelve NextAuth. La API valida el JWT y distingue los roles `ADMIN`, `AGENT` y `COMMUNITY`. Un usuario de staff que entra por el portal es redirigido al backoffice.

### 3.2 Datos e integraciones

- **Base de datos.** MySQL 8 en el mismo servidor, base `real_estate_platform`, acceso solo desde localhost. El esquema lo modelan las entidades TypeORM.
- **Archivos.** Cloudflare R2 (compatible S3). Logos, multimedia de propiedades, documentos y piezas del CMS se publican desde el bucket configurado. La optimización de imágenes usa Sharp.
- **Correo.** SMTP de Resend. Plantillas Handlebars para verificación de correo y recuperación de contraseña.
- **Valor UF.** El portal consulta el valor publicado para mostrarlo en la barra superior. Es un dato externo; si el proveedor no responde, el resto del sitio sigue disponible.

### 3.3 Cómo está publicado

El tráfico público entra solo por nginx en los puertos 80 y 443. HTTP redirige a HTTPS. El certificado es Let’s Encrypt para el dominio y sus subdominios `www`, `admin` y `core`.

nginx entrega cada host al proceso interno correspondiente. Esos procesos los mantiene PM2 con los nombres `rlst-core`, `rlst-portal` y `rlst-backoffice`. MySQL no se publica a internet.

```
Internet
   │
   ▼
nginx :443  (certificado Let's Encrypt)
   ├── bravoshottpropiedades.cl        → portal :8001
   ├── admin.bravoshottpropiedades.cl  → backoffice :8002
   └── core.bravoshottpropiedades.cl   → API :8000
                                          ├── MySQL :3306 (localhost)
                                          ├── R2 (archivos)
                                          └── Resend (correo)
```

## 4. Características

- Tres superficies separadas: visitante, cliente registrado y equipo interno.
- Un solo modelo de propiedad, con operación de venta o arriendo, ficha completa, multimedia, ubicación, precio, SEO y notas internas.
- Estados de publicación y asignación de agente como parte del ciclo operativo de la propiedad.
- CMS para la cara pública: identidad de la empresa, slider, nosotros, equipo, testimonios y blog.
- Contratos de venta y de arriendo, personas, tipos de documento y carga de documentos, incluido DNI.
- Autenticación con verificación de correo y recuperación de contraseña.
- Notificaciones para el usuario autenticado.
- Tema visual único en claro, con los tokens de color de la marca.
- El home del portal muestra “Propiedades destacadas” solo cuando existe al menos una propiedad publicada y marcada como destacada.

## 5. Funcionalidades entregadas

### 5.1 Portal

- Portada con slider, listado de propiedades y testimonios.
- Búsqueda y listados de venta y arriendo, ficha de propiedad y favoritos.
- Publicación de una propiedad por el visitante o el cliente, y flujos de vender, arrendar y valorizar.
- Páginas institucionales: nosotros, equipo, administración, blog y testimonio.
- Cuenta de comunidad: registro, ingreso, verificación de correo, recuperación de contraseña, datos personales, mis propiedades, mis contratos y pagos de un contrato, y notificaciones.

### 5.2 Backoffice

- Ingreso de administradores y agentes.
- Grillas y ficha de propiedades en venta y en arriendo, por secciones: información básica, características, ubicación, multimedia, SEO y marketing, notas e historial.
- Tipos de propiedad.
- Contratos de venta y de arriendo, personas, documentos y tipos de documento.
- Usuarios: administradores, agentes y comunidad.
- CMS: identidad de empresa por secciones (datos básicos, redes, alianzas y preguntas frecuentes), slider, nosotros, equipo, artículos y testimonios.
- Notificaciones internas.

### 5.3 API

Módulos de negocio entregados: autenticación, usuarios, recuperación de contraseña, propiedades, tipos de propiedad, multimedia, personas, contratos, documentos y tipos de documento, identidad, slides, artículos, equipo, testimonios, nosotros, notificaciones, correo, auditoría, analítica y una estimación de valor de propiedad basada en reglas.

## 6. Lo que esta entrega no incluye

Estos puntos quedan fuera del producto entregado y fuera de la garantía. Si se requieren, son un trabajo nuevo.

- Carga masiva de propiedades, fotografías o textos comerciales. El contenido lo ingresa el equipo del cliente desde el backoffice.
- Aplicaciones móviles nativas, pasarela de pago online e integración con portales inmobiliarios externos.
- Cambio de motor de base de datos, de proveedor de archivos o de proveedor de correo.
- Rediseño de la interfaz o un modo oscuro.
- Nuevos módulos, roles o procesos que no están descritos en la sección 5.

El sistema quedó sembrado con el mínimo necesario para operar: usuario administrador, tipos de propiedad, tipos de documento y propiedades de ejemplo. La identidad comercial, el slider y el catálogo real son contenido de operación, no un defecto de la entrega.

## 7. Inicio de la garantía

La firma de esta acta marca el inicio del período de garantía.

A falta de otro plazo escrito en el contrato comercial, la garantía dura **treinta (30) días corridos** desde la fecha de esta acta. El plazo cubre el comportamiento del sistema entregado en el ambiente de producción descrito arriba. No se reinicia por cada corrección, salvo que una corrección deje inoperante una función que antes estaba aceptada.

Una incidencia de garantía es un comportamiento del sistema entregado que no cumple lo descrito en las secciones 4 y 5, o un defecto visible en una pantalla ya construida, cuando se reproduce en producción con los datos y el rol correspondientes.

La forma de reportarla es una descripción del paso que se ejecutó, el resultado obtenido, el resultado esperado, la URL y, si aplica, una captura. El desarrollador la clasifica en el primer contacto como garantía, como contenido de operación o como trabajo fuera de alcance.

## 8. Qué se atiende dentro de la garantía

Se atienden, sin costo de desarrollo y dentro del plazo, las siguientes clases de hallazgo.

**Defectos de una función ya entregada.** Un guardado que responde error del servidor, una sección que no persiste, un enlace roto de una pantalla existente, un rol que ve o deja de ver algo contrario a lo entregado, o un servicio que no levanta por un defecto del artefacto desplegado.

**Correcciones estéticas de pantallas existentes.** Alineación, espacio, contraste, iconos que no se muestran, textos cortados, estados vacíos incorrectos y el mismo tipo de ajuste visual, siempre que no cambie la estructura de la pantalla ni agregue una vista nueva.

**Modificaciones menores de un proceso existente.** Ajustes puntuales de un flujo que ya está entregado: un mensaje de validación, un campo que debe aceptar vacío o debe exigir valor, el orden de campos en un formulario ya existente, u ocultar un bloque cuando no tiene datos. El criterio es que el proceso de negocio no cambia; cambia un detalle de cómo se completa.

Ejemplos que entran en garantía:

- La sección de SEO de una propiedad ya entregada no guarda.
- El home muestra “Propiedades destacadas” sin propiedades destacadas.
- Un botón de una pantalla existente queda ilegible o sin ícono.
- Un formulario existente rechaza un dato válido o exige un dato que ese flujo no necesita.

## 9. Qué queda fuera de la garantía

Queda fuera, y se cotiza como cambio, todo lo que agrega capacidad o altera el proceso de negocio.

- Pantallas, módulos, reportes, roles o integraciones que no están en la sección 5.
- Cambiar la regla de negocio: nuevos estados de propiedad, nuevas condiciones de contrato, comisiones, flujos de aprobación o permisos distintos de los entregados.
- Migrar catálogo, rediseñar la marca, cambiar dominios o mover el sistema de servidor.
- Caídas o cambios de Cloudflare R2, Resend, DNS, el emisor del certificado o el valor UF externo.
- Incidentes causados por edición manual de la base, de nginx o de los archivos de entorno, o por despliegues hechos fuera del procedimiento de esta entrega.
- Carga, corrección o borrado de contenido comercial: textos, fotos, precios y fichas que el equipo ingresa en el uso diario.

Si un reporte mezcla un defecto de garantía con una mejora, se corrige el defecto y la mejora se estima aparte.

## 10. Condiciones de la aceptación

A la fecha de esta acta se verificó en producción:

- https://bravoshottpropiedades.cl responde el portal.
- https://admin.bravoshottpropiedades.cl responde el backoffice y exige ingreso.
- https://core.bravoshottpropiedades.cl/api responde la API.
- Los tres procesos `rlst-portal`, `rlst-backoffice` y `rlst-core` están bajo PM2, detrás de nginx y del certificado HTTPS.
- La base MySQL `real_estate_platform` es la base de la aplicación.
- El tema de portal y backoffice permanece en claro con independencia del modo del dispositivo.

La aceptación de esta acta no exige que el catálogo comercial esté completo. Exige que las funciones de la sección 5 estén disponibles para que el equipo las use.

## 11. Conformidad

Al firmar, las partes declaran que el sistema descrito se encuentra entregado en el ambiente de producción y que, desde esta fecha, corre la garantía en los términos de las secciones 7, 8 y 9.

| | Nombre | Rol | Firma | Fecha |
|---|---|---|---|---|
| Entrega | | Desarrollo | | |
| Recibe | | Bravo Shott Propiedades | | |

# Manual de usuario

**Plataforma inmobiliaria Bravo Shott Propiedades**

Este manual describe, a nivel general, todo lo que se puede hacer en la plataforma. No es una guía paso a paso de cada pantalla: la idea es que cualquier persona sepa qué funciones existen, dónde encontrarlas y para qué sirven.

---

## Índice

1. [Qué es la plataforma](#1-qué-es-la-plataforma)
2. [Tipos de usuario](#2-tipos-de-usuario)
3. [Portal: lo que ve cualquier visitante](#3-portal-lo-que-ve-cualquier-visitante)
4. [Portal: cuenta del cliente](#4-portal-cuenta-del-cliente)
5. [Backoffice: operación interna](#5-backoffice-operación-interna)
6. [Flujos habituales](#6-flujos-habituales)
7. [Preguntas frecuentes](#7-preguntas-frecuentes)

---

## 1. Qué es la plataforma

La plataforma tiene dos aplicaciones web que comparten la misma información:

| Aplicación | Dirección | Para quién |
|---|---|---|
| **Portal** | https://bravoshottpropiedades.cl | Visitantes y clientes registrados |
| **Backoffice** | https://admin.bravoshottpropiedades.cl | Agentes y administradores de la empresa |

Lo que el equipo carga o modifica en el backoffice (propiedades, textos, imágenes, colores, menú) se refleja en el portal.

---

## 2. Tipos de usuario

| Usuario | Dónde entra | Qué puede hacer |
|---|---|---|
| **Visitante** | Portal, sin cuenta | Buscar propiedades, ver fichas, contactar, solicitar publicar o valorizar una propiedad |
| **Cliente (comunidad)** | Portal, con cuenta | Todo lo anterior, más favoritos, sus propiedades, sus contratos y pagos, y notificaciones |
| **Agente** | Backoffice | Gestionar propiedades, contratos, personas, documentos y contenido |
| **Administrador** | Backoffice | Todo lo del agente, más usuarios y reportes |

Si una persona del equipo interno intenta ingresar por el portal, el sistema la redirige al backoffice.

---

## 3. Portal: lo que ve cualquier visitante

### 3.1 Barra superior y menú

En la parte superior del portal se muestran, según la configuración de la empresa:

- Logo y nombre de la empresa.
- Correo y teléfono de contacto.
- Valor de la **UF del día**.
- Botones **Ingresar** y **Registrarse**.

El menú principal incluye por defecto:

- **Propiedades**: Ventas, Arriendos y Administraciones.
- **Nosotros**: Quiénes somos, Nuestro equipo y Testimonios.
- **Vende tu propiedad**, **Arrienda tu propiedad** y **Valoriza tu propiedad**.
- **Blog**.
- **Contacto**: abre un formulario para escribir a la empresa.

Los textos y opciones del menú se pueden activar, desactivar o renombrar desde el backoffice (**CMS → Top Bar**).

### 3.2 Página de inicio

- **Slider principal** con imágenes y mensajes destacados.
- **Propiedades destacadas**, en carrusel o en grilla según la configuración. Esta sección solo aparece si hay al menos una propiedad publicada y marcada como destacada.
- **Listado de propiedades** con filtros.
- **Testimonios** de clientes.

### 3.3 Buscar propiedades

Las páginas **Ventas** (`/properties/sale`) y **Arriendos** (`/properties/rent`) muestran las propiedades publicadas de cada tipo de operación. En la página de ventas solo se puede filtrar por venta, y en la de arriendos solo por arriendo.

Hay dos formatos de filtros, que la empresa elige desde el backoffice (**CMS → Listados**):

- **Filtros clásicos**, en la parte superior del listado.
- **Barra lateral de filtros**, a la izquierda en computador y como panel desplegable en el celular.

La barra lateral permite filtrar por:

- **Operación**: todas, venta o arriendo.
- **Tipo de propiedad**: casa, departamento, oficina, etc. Se pueden marcar varios.
- **Ubicación**: región y comuna.
- **Precio**: moneda (CLP o UF) y un rango que se ajusta arrastrando los extremos de una barra. El mínimo y el máximo de la barra salen de las propiedades realmente publicadas.
- **Distribución**: dormitorios, baños y estacionamientos.
- **Superficie**: rango de m² construidos y de m² de terreno, también con barra, y año de construcción mínimo.
- **Otras características**: piscina, quincho, bodega y similares.

El listado se actualiza solo al cambiar un filtro. El botón **Limpiar** quita todos los filtros. Los filtros quedan en la dirección de la página, así que se puede copiar el enlace y compartir la búsqueda.

### 3.4 Ficha de una propiedad

Al hacer clic en una propiedad se abre su ficha con:

- Galería de fotos y videos.
- Precio, ubicación, tipo y operación.
- Características: dormitorios, baños, superficies, estacionamientos y otras.
- Descripción.
- Mapa de ubicación.
- Formulario para mostrar interés o contactar a la empresa sobre esa propiedad.
- Propiedades relacionadas.

Desde la tarjeta de cada propiedad se puede marcar como **favorita** con el ícono de corazón. Para eso hay que tener una cuenta.

### 3.5 Vende o arrienda tu propiedad

Las opciones **Vende tu propiedad** y **Arrienda tu propiedad** permiten que cualquier persona envíe su propiedad para que la empresa la publique. Es un formulario por pasos:

1. **Información básica**: título, descripción, tipo de propiedad, precio y moneda.
2. **Características**: los campos cambian según el tipo de propiedad (m², dormitorios, baños, pisos, año, otras características).
3. **Ubicación**: región, comuna, dirección y punto en el mapa.
4. **Multimedia**: hasta 3 imágenes.
5. **Datos de contacto**: nombre, teléfono y correo. Si la persona tiene sesión iniciada, se completan solos.
6. **Resumen**: revisión antes de enviar.

Al enviar, la propiedad **no se publica de inmediato**: llega al backoffice como una solicitud que el equipo revisa y aprueba.

### 3.6 Valoriza tu propiedad

Entrega un **valor estimado** de una propiedad en tres pasos: tipo de operación y de propiedad, ubicación y características. La estimación es referencial y se basa en reglas calibradas con datos del mercado. Desde el resultado se puede continuar hacia la publicación.

### 3.7 Páginas institucionales

- **Quiénes somos**: historia y presentación de la empresa.
- **Nuestro equipo**: perfiles del equipo.
- **Testimonios**: opiniones de clientes.
- **Administraciones**: servicio de administración de propiedades.
- **Blog**: artículos con su página de detalle y artículos relacionados.
- **Privacidad**: política de privacidad.

Todo este contenido se edita desde el backoffice, en la sección **CMS**.

---

## 4. Portal: cuenta del cliente

### 4.1 Registro e ingreso

- **Registrarse**: crea una cuenta con correo y contraseña. El sistema envía un correo para **verificar la dirección**.
- **Ingresar**: con correo y contraseña.
- **¿Olvidaste tu contraseña?**: envía un correo con un enlace para crear una nueva.

### 4.2 Menú de la cuenta

Con la sesión iniciada aparece el menú de la cuenta:

| Opción | Qué hace |
|---|---|
| **Mis datos** | Ver y editar los datos personales |
| **Notificaciones** | Ver los avisos recibidos y configurar las alertas |
| **Mis propiedades** | Ver las propiedades que la persona envió y su estado |
| **Favoritos** | Ver las propiedades guardadas con el corazón |
| **Mis contratos** | Ver los contratos en que participa y el detalle de sus pagos |

### 4.3 Notificaciones

El cliente recibe avisos, por ejemplo, cuando cambia el estado de publicación de su propiedad o el estado de un contrato, o cuando se registra un pago.

En la página de notificaciones se puede configurar:

- **Sonido** al recibir una notificación, mientras la página está abierta.
- **Notificaciones push** del navegador, que llegan aunque la página esté cerrada. Dependen de que el navegador y el sistema operativo las permitan.

---

## 5. Backoffice: operación interna

El backoffice requiere ingresar con una cuenta de agente o administrador.

### 5.1 Dashboard

Pantalla inicial con indicadores generales:

- Ingresos totales del mes.
- Propiedades activas.
- Nuevos miembros de la comunidad.
- Tiempo promedio de venta.

### 5.2 Propiedades

Menú **Propiedades**, con tres opciones:

- **Venta**: propiedades en venta.
- **Arriendo**: propiedades en arriendo.
- **Tipos de propiedad**: crear y editar tipos (casa, departamento, oficina…) y definir qué características aplican a cada uno, por ejemplo si tiene dormitorios o m² de terreno.

Cada listado se puede ver en grilla (tabla) o en tarjetas, buscar, ordenar, filtrar por columna y **exportar a Excel**.

**Estados de una propiedad**

| Estado | Significado |
|---|---|
| Solicitud | Llegó desde el portal y espera revisión |
| Pre-aprobada | Revisada, aún no visible en el portal |
| Publicada | Visible en el portal |
| Inactiva | Oculta temporalmente |
| Contrato en curso | Tiene un contrato en proceso |
| Vendida / Arrendada | Operación cerrada |

**Ficha de la propiedad**

La ficha se organiza en secciones que se guardan por separado:

- **Información básica**: título, descripción, operación, estado, precio, moneda y agente asignado.
- **Características**: superficies, dormitorios, baños, estacionamientos, pisos, año y otras características.
- **Ubicación**: región, comuna, dirección y mapa.
- **Multimedia**: fotos y videos, y elección de la imagen principal.
- **SEO y marketing**: título y descripción para buscadores, palabras clave y el interruptor **Destacada**, que hace aparecer la propiedad en “Propiedades destacadas” del portal.
- **Notas internas**: comentarios que solo ve el equipo.
- **Historial**: registro de los cambios hechos a la propiedad.

### 5.3 Contratos

Menú **Contratos**:

- **Compraventa** y **Arriendo**: crear y gestionar contratos.
- **Personas**: base de personas que participan en los contratos.
- **Documentos**: documentos cargados al sistema.
- **Tipos de documentos**: catálogo de tipos (por ejemplo, escritura o certificado).

Al crear o editar un contrato se registra:

- La propiedad, el monto y la moneda (CLP o UF).
- Las **personas** y su rol. En arriendo, por ejemplo: arrendador, arrendatario, garante, notario, testigo y agente.
- Los **pagos**. En arriendo hay tipos como pago de arriendo, gasto común o administración, servicios básicos, comisión, depósito u otro.
- Los **documentos** del contrato.
- El **estado**: en proceso, cerrado o fallido.

En **Personas** se guardan los datos personales (nombre, RUT/DNI, contacto, dirección, nacionalidad, estado civil, profesión, empresa) y se puede cargar el **documento de identidad** por ambos lados.

### 5.4 Usuarios

Menú **Usuarios**:

- **Administradores**: cuentas con acceso completo.
- **Agentes**: equipo comercial, al que se le pueden asignar propiedades.
- **Comunidad**: clientes registrados en el portal, con una ficha de detalle por cliente.

### 5.5 CMS (contenido del portal)

Desde el menú **CMS** se administra lo que se ve en el portal, sin necesidad de programar:

| Opción | Qué se configura |
|---|---|
| **Slider** | Imágenes y textos del carrusel principal del inicio |
| **Sobre nosotros** | Contenido de “Quiénes somos” |
| **Nuestro equipo** | Perfiles del equipo |
| **Testimonios** | Opiniones de clientes |
| **Artículos de blog** | Crear, editar y publicar artículos |
| **Identidad de la empresa** | Nombre, logo, contacto, redes sociales, alianzas y preguntas frecuentes |
| **Top Bar** | Barra superior y menú del portal: qué datos mostrar, qué opciones del menú están activas y sus nombres |
| **Footer** | Contenido del pie de página |
| **Listados** | Formato de filtros en los listados: clásico o barra lateral |
| **Destacadas** | Cómo se muestran las propiedades destacadas: carrusel o grilla, con columnas y filas |
| **Paleta de colores** | Colores de marca del portal |

### 5.6 Notificaciones

El equipo recibe avisos, entre otros, por:

- Interés de un visitante en una propiedad.
- Mensajes de contacto.
- Solicitudes de publicación enviadas desde el portal.
- Asignación de una propiedad a un agente.
- Cambios de estado de publicación o de contrato.
- Pagos recibidos o atrasados.

Las notificaciones llegan **en tiempo real**: el contador de la barra superior se actualiza sin recargar la página. En la página de notificaciones se configura el sonido y las notificaciones push del navegador, igual que en el portal.

### 5.7 Reportes (solo administradores)

En **Reportes** se generan informes sobre la operación:

| Informe | Contenido |
|---|---|
| **Agentes** | Desempeño, propiedades asignadas, cierres y conversión |
| **Propiedades** | Registros agrupados por estado, operación, tipo y moneda |
| **Contratos** | Cantidad y monto contractual por operación y estado |
| **Geográfico** | Propiedades y cierres por región y comuna |

Se puede elegir el período (esta semana, este mes, últimos 7 días, 3, 6 o 12 meses, un rango personalizado o todo el período) y filtrar por operación. Cada informe muestra gráficos y una tabla, y se puede **imprimir o guardar como PDF** y **exportar a Excel**.

### 5.8 Otras opciones

- **Mi cuenta**: desde el nombre de usuario en la barra superior, para editar los datos propios.
- **Acerca de**: información del sistema.

---

## 6. Flujos habituales

### Publicar una propiedad que llega desde el portal

1. Un visitante completa **Vende tu propiedad** o **Arrienda tu propiedad**.
2. El equipo recibe una notificación de **solicitud de publicación**.
3. En el backoffice, en **Propiedades → Venta** o **Arriendo**, la propiedad aparece con estado **Solicitud**.
4. Un agente revisa la información, la completa si hace falta (fotos, características, ubicación) y cambia el estado a **Publicada**.
5. La propiedad queda visible en el portal.

### Destacar una propiedad en el inicio

1. Abrir la ficha de la propiedad en el backoffice.
2. En **SEO y marketing**, activar **Destacada** y guardar.
3. La propiedad aparece en “Propiedades destacadas” del inicio, siempre que esté **Publicada**.
4. El formato (carrusel o grilla) se define en **CMS → Destacadas**.

### Registrar un contrato de arriendo

1. En **Contratos → Personas**, verificar que existan las personas que participan, o crearlas.
2. En **Contratos → Arriendo**, crear el contrato: propiedad, monto, moneda, personas con su rol y pagos.
3. Adjuntar los documentos del contrato.
4. Ir actualizando los pagos y el estado del contrato. El cliente puede seguirlo desde **Mis contratos** en el portal.

### Cambiar el menú o la apariencia del portal

- Menú y barra superior: **CMS → Top Bar**.
- Pie de página: **CMS → Footer**.
- Colores: **CMS → Paleta de colores**.
- Logo, contacto y redes: **CMS → Identidad de la empresa**.

---

## 7. Preguntas frecuentes

**Marqué una propiedad como destacada y no aparece en el inicio.**
Revisa que su estado sea **Publicada**. Si la sección usa formato grilla, puede estar en la segunda página de destacadas.

**Envié una propiedad desde el portal y no se ve publicada.**
Las propiedades enviadas desde el portal quedan como **Solicitud** hasta que el equipo las revisa y las publica.

**No me llegan las notificaciones push.**
El navegador tiene que tener permiso para mostrar notificaciones y el sistema operativo no debe bloquearlas. Se activan desde la página de **Notificaciones**.

**No veo la opción Reportes en el backoffice.**
Reportes solo está disponible para usuarios con rol **Administrador**.

**¿El valor de la valorización es una tasación oficial?**
No. Es una estimación referencial para orientar al cliente.

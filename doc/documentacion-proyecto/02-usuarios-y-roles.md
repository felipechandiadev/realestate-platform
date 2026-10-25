# 02 · Usuarios, roles y permisos

## 2.1 Tipos de usuario

| Tipo | Rol técnico | Dónde entra | Qué hace |
|---|---|---|---|
| Visitante | — (sin cuenta) | Portal | Busca, ve fichas, consulta, solicita publicar o tasar |
| Cliente / comunidad | `COMMUNITY` | Portal | Lo anterior + favoritos, datos personales, mis propiedades, mis contratos y pagos, notificaciones |
| Agente | `AGENT` | Backoffice | Gestiona propiedades y contratos asignados, ve notificaciones |
| Administrador | `ADMIN` | Backoffice | Todo lo anterior + usuarios, CMS, reportes y configuración |

Un usuario de staff (admin o agente) que ingresa por el portal es redirigido al backoffice.

## 2.2 Estados de usuario

`ACTIVE` (activo), `INACTIVE` (inactivo, no puede ingresar), `VACATION` (vacaciones) y `LEAVE` (licencia). Los dos últimos sirven para la gestión del equipo de agentes.

## 2.3 Permisos

La API define permisos granulares que se asignan según el rol, entre ellos:
`MANAGE_USERS`, `MANAGE_AGENTS`, `MANAGE_ADMINS`, `MANAGE_PROPERTIES`, `ASSIGN_PROPERTY_AGENT`, `MANAGE_CONTRACTS`, `MANAGE_NOTIFICATIONS`, `MANAGE_MULTIMEDIA`, `MANAGE_DOCUMENT_TYPES`, `MANAGE_PROPERTY_TYPES`, `MANAGE_ARTICLES`, `MANAGE_TESTIMONIALS`, entre otros.

Regla general: **el frontend oculta lo que no corresponde, pero quien decide es la API**. Aunque alguien manipule la interfaz, la API rechaza la acción si el rol no tiene permiso.

## 2.4 Cuenta y acceso

- **Registro** (solo comunidad) con verificación de correo: el enlace dura 24 h.
- **Ingreso** con correo y contraseña. La sesión es un JWT gestionado por NextAuth.
- **Recuperación de contraseña** por correo: el enlace dura 30 minutos por defecto.
- Las respuestas de verificación y recuperación son neutras: no revelan si un correo existe.
- Los admins y agentes los crea un administrador desde *Backoffice → Usuarios*.

## 2.5 Personas vs. usuarios

- **Usuario**: alguien que inicia sesión.
- **Persona**: ficha de una persona natural (nombre, RUT/DNI, contacto) que participa en contratos: vendedor, comprador, arrendador, arrendatario, aval, etc.

Un usuario de comunidad tiene una persona asociada. Muchas personas de un contrato no tienen usuario.

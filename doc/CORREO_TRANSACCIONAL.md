# Correo transaccional (Resend)

> **Propósito:** dejar constancia, para la entrega al cliente, de qué servicio envía los correos de la plataforma, qué credenciales usa, dónde viven y qué limitaciones tiene el plan contratado.
>
> **Importante:** este documento **no contiene secretos**. Las credenciales viven en el archivo de entorno del servidor (`core/.env`) y en la cuenta de Resend. Ver [Acta de entrega §2](./ACTA_DE_ENTREGA.md).

---

## 1. Resumen

| Concepto | Valor |
|---|---|
| Proveedor | **Resend** (https://resend.com) |
| Modo de integración | **SMTP** (no se usa la API ni el SDK de Resend) |
| Cliente en el código | `@nestjs-modules/mailer` (nodemailer) — `core/src/modules/mail/` |
| Host / puerto | `smtp.resend.com` : `587` (STARTTLS) |
| Remitente | `MAIL_FROM` en `core/.env` (dominio `bravoshottpropiedades.cl`) |
| Nombre visible del remitente | Nombre de la empresa en *Backoffice → CMS → Identidad* (se lee al primer envío y queda en caché hasta reiniciar el core) |
| Plantillas | Handlebars en `core/src/modules/mail/templates/` |
| Desarrollo local | `MAIL_HOST=localhost`, `MAIL_PORT=1025` (Mailpit/Mailhog, `npm run mail:dev`) — no envía correos reales |

---

## 2. Credenciales

### 2.1 Variables de entorno (servidor, `core/.env`)

| Variable | Contenido | Notas |
|---|---|---|
| `MAIL_HOST` | `smtp.resend.com` | — |
| `MAIL_PORT` | `587` | El código usa `secure: false` (STARTTLS). El puerto 465 **no** funciona sin cambiar código. |
| `MAIL_USER` | Usuario SMTP de Resend | En Resend el usuario SMTP es literalmente `resend`. |
| `MAIL_PASS` | **API key de Resend** | Es un secreto. Se genera en *Resend → API Keys*. Si se filtra, revocarla allí y crear otra. |
| `MAIL_FROM` | Dirección remitente | Debe pertenecer a un dominio **verificado** en Resend. |
| `PORTAL_URL` / `FRONTEND_PUBLIC_URL` | URL pública del portal | Se usa para los enlaces de verificación y de restablecer contraseña. Si está mal, los enlaces apuntan a otro sitio. |
| `PASSWORD_RESET_TOKEN_TTL` | Minutos de validez del enlace de recuperación | Opcional; por defecto **30 minutos**. |

Plantilla de referencia sin valores: `envs/core.env.example`.

### 2.2 Datos a entregar al cliente (completar al momento de la entrega, **fuera del repositorio**)

| Dato | Valor | Responsable |
|---|---|---|
| Cuenta de Resend (correo del dueño) | _(completar)_ | |
| Acceso al panel de Resend transferido al cliente | ☐ Sí ☐ No | |
| Plan contratado en Resend | _(Free / Pro / Scale / …)_ | |
| Medio de pago de Resend a nombre de | _(completar)_ | |
| API key en uso (nombre/ID en Resend, **no** el valor) | _(completar)_ | |
| Dominio verificado en Resend | `bravoshottpropiedades.cl` ☐ verificado | |
| Registros DNS (SPF, DKIM, DMARC) creados en | _(proveedor DNS)_ | |
| Quién puede rotar la API key | _(completar)_ | |

> Recomendación: al entregar, **rotar la API key** (crear una nueva a nombre del cliente, actualizar `MAIL_PASS` en el servidor, reiniciar el core y revocar la anterior).

---

## 3. Limitaciones del plan

> ⚠️ **Verificar en el panel de Resend al momento de la entrega**: los límites cambian según el plan y Resend puede actualizarlos. Los valores siguientes son de referencia.

| Límite | Plan gratuito (referencia) | Qué pasa al superarlo |
|---|---|---|
| Correos por día | ~100 | Resend rechaza los envíos hasta el día siguiente. |
| Correos por mes | ~3.000 | Rechazo hasta el siguiente ciclo o hasta subir de plan. |
| Dominios verificados | 1 | — |
| Retención de logs en el panel | Limitada (pocos días) | Se pierde el historial para diagnosticar. |

**Impacto en la plataforma si se alcanza el límite:**
- Fallan **todos** los correos, incluidos los críticos: verificación de cuenta y recuperación de contraseña.
- La plataforma **no reintenta** ni encola: los correos fallidos se pierden (solo quedan en el log del core).
- Los usuarios no reciben error visible en verificación ni recuperación (respuesta neutra por seguridad), por lo que el problema puede pasar desapercibido. Revisar el panel de Resend ante reclamos.

### Estimación de volumen

| Evento | Correos que genera |
|---|---|
| Registro de usuario | 1 (verificación) + 1 al verificar (bienvenida) |
| Recuperación de contraseña | 1 |
| Interés en una propiedad (formulario) | 1 al visitante + 1 por cada admin + 1 al agente asignado |
| Solicitud de publicación (vender/arrendar/tasar) | 1 al solicitante + 1 por cada admin |
| Cambio de estado de publicación | 1 al solicitante |
| Mensaje de contacto | 1 por cada admin |
| Compartir propiedad por correo (backoffice) | 1 |

Ejemplo: con 3 admins, cada lead de interés consume **5 correos**. 20 leads diarios ≈ 100 correos, que ya es el límite diario del plan gratuito.

---

## 4. Requisitos de entregabilidad

Para que los correos no lleguen a spam, el dominio del remitente debe estar verificado en Resend con:

- [ ] **SPF** (registro TXT indicado por Resend)
- [ ] **DKIM** (registros indicados por Resend)
- [ ] **DMARC** recomendado (`_dmarc.bravoshottpropiedades.cl`, al menos `p=none` con reporte)
- [ ] `MAIL_FROM` usa ese mismo dominio

---

## 5. Correos que envía la plataforma

| Correo | Disparador | Plantilla |
|---|---|---|
| Verificación de cuenta | Registro / reenvío | `email-verification.hbs` (enlace válido 24 h) |
| Bienvenida | Al verificar la cuenta | `welcome.hbs` |
| Recuperación de contraseña | "Olvidé mi contraseña" | `password-reset.hbs` (enlace válido 30 min por defecto) |
| Confirmación de interés | Formulario de interés en propiedad | `interest-confirmation.hbs` (no reenvía el mensaje del visitante) |
| Aviso a admin/agente | Interés, contacto, otros | `admin-notification.hbs` |
| Solicitud de publicación (usuario / admin) | Vender, arrendar, tasar | `property-request-user.hbs` / `property-request-admin.hbs` |
| Cambio de estado de publicación | Backoffice cambia el estado | `property-status-change.hbs` |
| Compartir propiedad | Backoffice → compartir | `property-share.hbs` |
| Correo de prueba | `POST /mail/test` (solo ADMIN) | — |

---

## 6. Limitaciones conocidas del modelo actual

- **Sin cola ni reintentos:** un envío que falla (SMTP caído, límite alcanzado, reinicio del proceso) se pierde.
- **Sin registro de estado de envío** en la base de datos; el seguimiento se hace en el panel de Resend.
- **SMTP en vez de API:** no se reciben *webhooks* de rebotes o quejas. Migrar a la API de Resend permitiría reintentos y seguimiento de rebotes.
- **Límite de abuso por IP**, no por destinatario (5 por minuto en registro, recuperación y formularios públicos).
- Detalle técnico y mejoras sugeridas: ver evaluación del sistema de correo (sesión del 24-10-2026) y `doc/ROADMAP_MEJORAS.md`.

---

## 7. Operación

- **Probar el envío:** `POST /mail/test` con un usuario ADMIN y `{ "email": "destino@..." }`.
- **Diagnosticar un correo no recibido:** 1) panel de Resend → *Emails* (¿salió?, ¿rebotó?); 2) log del core (`pm2 logs`), buscar `Error sending`; 3) carpeta de spam del destinatario.
- **Cambiar de plan o de proveedor:** solo requiere actualizar `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASS` y `MAIL_FROM` en `core/.env` y reiniciar el core (cualquier proveedor SMTP con STARTTLS en 587 funciona sin cambios de código).

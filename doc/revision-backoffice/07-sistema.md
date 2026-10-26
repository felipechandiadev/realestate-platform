# Bloque 7 — Sistema: revisado el 25-10-2026

> Secciones: Login, Notificaciones (lista y tiempo real), Acerca de, PWA y modo sin conexión, páginas de desarrollo (`/test-colors`).
> Método: [Plan de revisión §1](../PLAN_REVISION_BACKOFFICE.md). Entorno local con portal, backoffice y API. Los límites de intentos se probaron llamando a la API como lo hace NextAuth (desde `localhost`) y simulando un visitante externo (`X-Forwarded-For`).

## Resumen

| Eje | Resultado | Nota |
|---|---|---|
| A Funcional | ✅ | Login, notificaciones y Acerca de funcionan |
| B Reglas | ❌ | Los límites de intentos no se aplican a lo que pasa por el portal y el backoffice |
| C Permisos | ⚠️ | El canal de notificaciones en tiempo real no revisa si la cuenta sigue activa; `/test-colors` del portal es pública |
| D Datos | ⚠️ | Acerca de muestra una versión y fecha fijas que no corresponden a la entrega |
| E Vacíos y errores | ⚠️ | El login muestra el mismo mensaje para todo tipo de error |
| F Móvil | — | Cubierto en bloques anteriores |
| G Visual | 🟡 | Tipos de notificación en código técnico (`CAMBIO_ESTADO_PUB…`) |
| H Rendimiento | — | El service worker (PWA) solo funciona en producción; en desarrollo da errores esperables |

## Hallazgos

| # | Sev. | Tipo | Hallazgo | Evidencia | Decisión / estado |
|---|---|---|---|---|---|
| 1 | 🔴 | garantía | **Probar contraseñas desde el login del backoffice o del portal no tiene límite.** NextAuth llama a la API desde el servidor (`localhost`) y `localhost` está exento del límite (`THROTTLE_SKIP_IPS`). Solo la API llamada directamente limita a 10 intentos por minuto. | 15 intentos fallidos desde `localhost`: 15 × 401, ningún 429. Con IP externa simulada: el intento 11 ya es 429. | ✅ **Corregido:** el portal y el backoffice reenvían la IP del visitante (`x-client-ip`) en login, registro, recuperación, verificación y formularios públicos; core la usa como clave del límite solo si la petición viene de una IP de confianza. Verificado: 13 intentos por el formulario del backoffice → esa IP queda en 429; otra IP entra normal. Bloqueo por cuenta: pendiente (mejora) |
| 2 | 🔴 | garantía | **Spam ilimitado en los formularios públicos** (contacto e interés en propiedad): el portal los envía desde el servidor, así que el límite de 5 por minuto no se aplica. Cada envío genera una notificación y un correo por administrador, y **consume la cuota de Resend** (≈100 correos/día en el plan gratuito). | 8 envíos de contacto seguidos desde `localhost`: 8 × 201 → 16 notificaciones (2 admins). | ✅ **Corregido** con el mismo cambio (contacto, interés y publicación pública ya se limitan por visitante). Captcha: pendiente (mejora) |
| 3 | 🟠 | garantía | **`/test-colors` del portal es pública** (página de desarrollo con la paleta). En el backoffice exige sesión. | `GET localhost:8001/test-colors` → 200 sin sesión. | ✅ **Corregido:** `/test-colors` eliminada del portal y del backoffice |
| 4 | 🟠 | garantía | **El tiempo real de notificaciones no corta a usuarios desactivados.** El socket valida solo el token (12 h); un usuario desactivado o eliminado sigue recibiendo avisos hasta que vence. La API REST sí lo corta desde la corrección de Usuarios. | Código: `NotificationsGateway.handleConnection` no consulta el estado. | ✅ **Corregido:** el socket comprueba con `SessionUserService` que la cuenta exista y esté activa |
| 5 | 🟡 | garantía | **Acerca de muestra "1.33.1 — 21 de diciembre de 2025"**, valores fijos en el código por defecto. | `shared/config/app-info.ts`. | Tomar versión y fecha del build (`package.json` / variable de entorno al desplegar) |
| 6 | 🟡 | garantía | **El login dice "Credenciales inválidas o sin acceso staff" para todo:** cuenta inactiva, demasiados intentos o API caída. | `login/page.tsx`. | Mensajes distintos para 401, 403 (inactiva), 429 y error de conexión |
| 7 | 🟡 | garantía | **Tipos de notificación en código técnico** en la grilla (`CAMBIO_ESTADO_PUB…`, `INTERES`, `CONTACTO`). | Captura de `/notifications`. | Etiquetas legibles |

**Lo que está bien:** las notificaciones solo se leen por su destinatario o por el equipo (`assertCanAccessNotification`); el contador de la campana coincide con la lista; el socket rechaza conexiones sin token o con token vencido; `/test-colors` del backoffice exige sesión; la API llamada directamente sí limita intentos por IP (detrás de nginx, con `trust proxy`).

## Despliegue

Para que el límite funcione en producción, nginx debe seguir enviando `X-Forwarded-For`/`X-Real-IP` al portal y al backoffice (ya está en `deploy/nginx`), y `THROTTLE_SKIP_IPS` debe incluir la IP desde la que el portal y el backoffice llaman a core (por defecto `localhost`). Si en el servidor llaman a core por su URL pública, hay que agregar esa IP a `THROTTLE_SKIP_IPS`.

## Prioridad de corrección (original)

1. **#1 y #2** (🔴): exponen las cuentas a fuerza bruta y la cuota de correo a abuso. Comparten la causa y el arreglo.
2. **#3 y #4**.
3. **#5 a #7**: menores.

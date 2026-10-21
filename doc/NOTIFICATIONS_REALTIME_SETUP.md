# Notificaciones en tiempo real y Push

## Implementación incluida

- Core valida el token JWE/JWT del handshake Socket.IO y suscribe el socket exclusivamente a la sala `user:<sub>` obtenida del token.
- Tras persistir una notificación, Core emite `notification:new` a cada destinatario y envía un aviso Web Push genérico si ese usuario registró una suscripción.
- Las notificaciones siguen almacenadas en la tabla existente; los eventos WS/Push no sustituyen la consulta persistida.
- Backoffice y Portal actualizan el contexto/contador/listado al recibir un evento y se reconcilian al cargar o reconectar.
- La preferencia de sonido es local por navegador/usuario y el audio se reproduce solo con la página visible y después de una interacción explícita.
- Push usa el texto genérico “Tienes una nueva notificación”; el MP3 personalizado no se puede garantizar cuando la aplicación está en segundo plano/cerrada.

## Configuración requerida antes de activar Push

1. Generar un par de claves VAPID con `npx web-push generate-vapid-keys` en un entorno confiable.
2. Configurar `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` y `VAPID_SUBJECT` en el entorno del Core. No versionar la clave privada.
3. Copiar la clave pública VAPID al cliente mediante el endpoint `GET /notifications/push/public-key`; el cliente no requiere una variable adicional.
4. Ejecutar la migración TypeORM `CreateNotificationPushSubscriptions1792160000000` antes de habilitar suscripciones en producción. La sincronización automática queda para desarrollo/test.
5. Confirmar que cada aplicación corre por HTTPS (excepto localhost), requisito para Service Workers y Web Push.

## Configuración de Socket.IO en despliegue

- Mantener habilitadas conexiones WebSocket y solicitudes de actualización (HTTP Upgrade) en el proxy inverso.
- `PORTAL_URL` y `BACKOFFICE_URL` deben coincidir con los orígenes permitidos de los clientes.
- La emisión en esta versión es local a la instancia Core. Si se ejecutan varias instancias, instalar/configurar un adapter compartido (por ejemplo Redis) antes de desplegar en producción.
- Monitorizar fallos de conexión/entrega sin registrar tokens, claves ni contenido privado.

## Prueba funcional

1. Iniciar Core, Portal y Backoffice con un usuario destinatario conectado.
2. En `/notifications`, habilitar sonido y/o Push desde el botón explícito; conceder permiso cuando el navegador lo solicite.
3. Crear una notificación para un usuario y comprobar actualización del badge/listado sin recargar.
4. Dejar el sitio en segundo plano o cerrar la pestaña y comprobar Push; el clic debe abrir `/notifications`.
5. Probar dos cuentas distintas: solo el destinatario debe recibir el evento y el Push.
6. Confirmar que la preferencia/Push se desactiva y que un permiso denegado no afecta a la bandeja persistida.

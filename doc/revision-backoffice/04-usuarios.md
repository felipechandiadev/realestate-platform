# Bloque 4 — Usuarios: revisado el 25-10-2026

> Secciones: Administradores (`/users/administrators`), Agentes (`/users/agents`), Comunidad (`/users/community`, `/[id]`).
> Método: [Plan de revisión §1](../PLAN_REVISION_BACKOFFICE.md). Entorno local (MySQL Docker + seed), con un ADMIN y un AGENTE, en escritorio (1440 px) y móvil (375 px). Los permisos se probaron llamando a la API directamente, no solo desde la interfaz.

## Resumen

| Eje | Resultado | Nota |
|---|---|---|
| A Funcional | ✅ | Listar, crear, editar, cambiar estado, eliminar y restablecer contraseña funcionan |
| B Reglas | ❌ | Un admin puede desactivarse o quitarse el rol a sí mismo; un agente puede crear cuentas de agente; contraseñas sin mínimo |
| C Permisos | ❌ | El acceso revocado sigue funcionando hasta 12 h; el agente ve los datos de todos los usuarios vía `GET /users` |
| D Datos | ⚠️ | "Último acceso" nunca se actualiza |
| E Vacíos y errores | ⚠️ | Un agente que abre Administradores ve "Error al cargar… recarga la página" en vez de "Sin permiso" |
| F Móvil | ⚠️ | En Agentes y Administradores los botones Editar/Eliminar quedan fuera de la pantalla |
| G Visual | ❌ | Estados en inglés (ACTIVE, VACATION) y fechas en formato técnico en Administradores y Agentes |
| H Rendimiento | ✅ | Cargas rápidas con el seed; sin errores de consola propios de estas pantallas |

**Lo que está bien:** el agente recibe 403 al intentar leer administradores, editar, eliminar o cambiar el estado de otro usuario, y al crear un ADMIN. El correo duplicado devuelve un mensaje claro. El login rechaza usuarios inactivos. Un agente no ve botones de editar ni eliminar en Agentes y Comunidad. La ficha del cliente (Comunidad → detalle) es completa y clara.

## Hallazgos

| # | Sev. | Tipo | Hallazgo | Evidencia | Decisión / estado |
|---|---|---|---|---|---|
| 1 | 🔴 | garantía | **El acceso revocado no se corta.** El rol y el estado se leen del token (válido 12 h). Un usuario desactivado, eliminado o al que se le quita el rol ADMIN sigue operando con su sesión abierta hasta que vence. | Desactivar al agente → con su token anterior `GET /users` = 200; un login nuevo sí responde "Usuario inactivo". | ✅ **Corregido:** en cada petición se confirma en la base que el usuario exista y esté activo, y se usa su rol actual (caché de 15 s, invalidada al cambiar estado, rol o eliminar) |
| 2 | 🔴 | garantía | **Un agente puede crear cuentas de agente** (`POST /users` acepta AGENT y COMMUNITY desde un agente). Esas cuentas entran al backoffice. | Agente crea `qa.ag2.x@example.com` con rol AGENT → 201. | ✅ **Corregido:** un agente solo puede crear clientes; el botón "+" de Agentes se oculta al agente |
| 3 | 🟠 | garantía | **Un admin puede dejarse fuera:** desactivarse, quitarse el rol o eliminarse a sí mismo, y nada impide quedar sin ningún administrador activo. | `PATCH /users/<propio>/status` INACTIVE → 200; `PATCH …/role` AGENT → 200. | ✅ **Corregido:** nadie puede quitarse acceso a sí mismo y siempre queda un administrador activo |
| 4 | 🟠 | mejora | **Vacaciones y licencia bloquean el login.** Solo ACTIVE puede entrar. Si la intención era solo no asignarle propiedades, hoy el agente queda sin acceso. | Agente en VACATION → "Usuario inactivo." | **Confirmar con el cliente** qué deben significar Vacaciones y Licencia |
| 5 | 🟠 | garantía | **El agente ve los datos de todos los usuarios**, incluidos administradores (correo, teléfono, permisos), vía `GET /users`, aunque `GET /users/admins` le está prohibido. | Agente → `GET /users` 200 con 5 usuarios y roles ADMIN/AGENT/COMMUNITY. | ✅ **Corregido:** `GET /users` solo para ADMIN (no lo usa ningún front) |
| 6 | 🟠 | garantía | **Contraseñas sin requisito mínimo** al crear usuarios desde el backoffice. | Crear agente con contraseña "1" → 201. | ✅ **Corregido:** mínimo 8 caracteres al crear usuarios y al cambiar contraseña |
| 7 | 🟠 | garantía | **Eliminar un agente no revisa sus propiedades asignadas** ni sus contratos: quedarían apuntando a un usuario eliminado. | Código: `SoftDeleteUserUseCase` borra sin validar. En el seed no había agentes con propiedades para reproducirlo. | ✅ **Corregido:** no se desactiva ni elimina un usuario con propiedades asignadas o contratos en proceso; vacaciones y licencia sí se permiten |
| 8 | 🟡 | garantía | **Estados en inglés y fechas técnicas** en Administradores y Agentes ("ACTIVE", "VACATION", "2026-10-24T20:33:20.311Z"). Comunidad sí muestra "Activo" y fecha legible. | Capturas de las grillas. | Reutilizar el formato de Comunidad |
| 9 | 🟡 | garantía | **"Último acceso" no se actualiza nunca**: el login no escribe `lastLogin`. | Admin entra hoy; `lastLogin` sigue con la fecha del seed. | Guardar `lastLogin` en el login |
| 10 | 🟡 | garantía | **Mensaje engañoso sin permiso:** el agente que abre `/users/administrators` ve "Error al cargar… recarga la página". | Captura con sesión de agente. | Mostrar "No tienes permiso" o redirigir |
| 11 | 🟡 | garantía | **Móvil:** en Agentes y Administradores las acciones quedan fuera de la pantalla (hay que desplazar la tabla); en Comunidad la columna de acciones fija tapa Apellido y Estado. | Capturas a 375 px. | Acciones al inicio de la fila o vista de tarjetas en móvil |
| 12 | 🟡 | deuda | **Componentes duplicados sin uso:** `app/users/administrators/ui/` y `app/users/agents/ui/` (16 archivos). Las páginas usan `src/features/users/components/`. | Búsqueda de imports: 0 usos. | Eliminar |
| 13 | 🟡 | garantía | **Editar agente** guarda en dos llamadas separadas (datos y estado); si falla la segunda, el cambio queda a medias sin aviso. | Código: `updateAgent` en `agents.action.ts`. | Una sola llamada o avisar el fallo parcial |

**Anotado para el bloque 5 (Dashboard):** el agente ve los ingresos totales de la corredora, y aparece en pantalla una línea de depuración ("Diagnóstico: 0 pago(s) reconocidos…").

## Correcciones aplicadas

Los hallazgos 1, 2, 3, 5, 6 y 7 se corrigieron con tests (`user-account-rules.spec.ts`, `session-user.service.spec.ts`, `users.controller.accounts.spec.ts`) y se verificaron por API en el entorno local. Efecto del #1 junto con el #4: un agente puesto en Vacaciones o Licencia pierde el acceso **de inmediato** (antes, al vencer su token). Si el cliente decide que esos estados deben poder entrar, se cambia en un solo lugar (`SessionUserService` y el login).

## Prioridad de corrección (original)

1. **#1 y #2** (🔴): cortan accesos indebidos.
2. **#3, #5, #6, #7**: reglas de cuentas y datos personales.
3. **#4**: requiere decisión del cliente.
4. **#8 a #13**: visuales y limpieza; se pueden agrupar en un solo cambio.

## Datos de prueba

En la base local se cambió la contraseña de `agent2@re.cl` para iniciar sesión como agente; está en el scratchpad de la sesión, no en el repositorio. Las cuentas de prueba creadas (`qa.ag2.x@example.com`, `weak.x@example.com`) quedaron eliminadas.

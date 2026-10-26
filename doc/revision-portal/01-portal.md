# Revisión del portal — 25-10-2026

> Alcance: todas las rutas de `portal/` (Next.js, puerto 8001) y los endpoints públicos de `core/` que consumen.
> Método: **lectura de código sección por sección**. Los servicios no estaban levantados (puertos 8000/8001/8002 cerrados), así que **nada se probó en ejecución**: cada hallazgo indica su evidencia en código. Lo marcado "por confirmar" necesita una prueba con el stack encendido.
> Estado técnico: `tsc --noEmit` sin errores, `npm test` 7/7, `eslint` 0 errores y 120 avisos (variables sin uso).

## Resumen por sección

| Sección | Resultado | Hallazgos |
|---|---|---|
| Estructura general (layout, menú, pie, SEO) | ⚠️ | #4, #5, #9, #10, #11 |
| Portada y listados (venta / arriendo / filtros) | 🔴 | #1, #8 |
| Ficha de propiedad | 🔴 | #1, #2, #12 |
| Captación (contacto, interés, publicar, vender, arrendar, tasación) | ⚠️ | #3, #13, #14 |
| Cuenta (login, registro, recuperación, verificación) | ⚠️ | #6, #7 |
| Mi cuenta (datos, propiedades, favoritos, contratos, notificaciones) | ✅ | #15 |
| Institucionales y blog | ⚠️ | #5, #16 |
| Privacidad y legal | ⚠️ | #17 |
| Código muerto y mantenimiento | 🟡 | #18, #19 |

## Hallazgos

| # | Sev. | Dónde | Hallazgo | Evidencia | Propuesta |
|---|---|---|---|---|---|
| 1 | 🔴 | API pública usada por portada, ventas, arriendos, destacadas y "relacionadas" | **Los listados públicos devuelven la entidad `Property` completa**, no la vista pública. Incluye `internalNotes` (notas internas del equipo), `changeHistory` (ids de usuario y valores anteriores), `views`, `favorites` (ids de usuarios), `creatorUserId`, y `postRequest`/`leads` si traen datos. Solo `/properties/:id/full` y `/properties/public` usan el filtro seguro. | `get-published-properties-filtered.usecase.ts` (`getMany()` y `return data`), `find-published-featured-public*.usecase.ts` (`rows as Partial<Property>[]`), `property.service.ts:457` `getRelatedProperties` (`createQueryBuilder('p')…getMany()`). El interceptor global solo oculta campos con `@Exclude` y hoy es solo `User.password`. Existe `toPublicPropertyDetail` (`public-property.mapper.ts`) que no se aplica aquí. **Por confirmar:** `curl /properties/published/filtered` y buscar `internalNotes`. | Pasar cada fila por un mapper público (lista de campos permitidos) en esos 4 casos de uso y en `related`. Test que falle si aparece `internalNotes` en alguna respuesta `@Public`. **✅ Corregido:** `toPublicPropertyListItem` se aplica a filtrado, destacadas (ambas) y relacionadas; `related` devuelve `[]` si la base no está publicada. |
| 2 | 🟠 | Ficha `/properties/property/[id]` | **Una propiedad inexistente responde 200**, no 404 (muestra "Propiedad no encontrada" dentro de la página). Los buscadores indexan páginas vacías y los enlaces rotos no se detectan. Además `related/:id` responde también para propiedades no publicadas. | `page.tsx` no usa `notFound()`. | `notFound()` + `not-found.tsx`; que `related` devuelva `[]` si la propiedad base no está publicada. |
| 3 | 🟠 | Interés en propiedad (`POST /notifications/public/property-interest`) | **La API confía en `assignedAgentId`, `interestedUserId` y `propertyId` del cuerpo** sin validar que existan ni que correspondan a la propiedad. Llamándola directo se puede mandar notificaciones a cualquier usuario y firmar el mensaje como otro usuario. Además registra en consola el nombre, correo, teléfono y mensaje completos. | `notifications.service.ts:38-128` (`console.log` de todos los datos) y `notification.dto.ts` (`IsString`, sin `IsUUID` ni verificación). | Resolver el agente desde la propiedad (no desde el cliente), tomar el usuario solo del token, exigir propiedad publicada y quitar los `console.log` con datos personales. **✅ Corregido:** core ignora `assignedAgentId`/`interestedUserId` del cuerpo (agente de la propiedad, usuario del token), exige propiedad publicada y ya no registra los datos; el portal envía el Bearer. Quedan `console.log` con datos en `notifyContactToAdmins`. |
| 4 | 🟠 | Sitemap | **`/services` está en el sitemap pero la ruta no existe** (la página es `/services/management`). Las URLs de artículos del blog y `/publish` tampoco están. `lastModified` de fichas siempre es "ahora" porque `/properties/public` no devuelve `updatedAt`. | `app/sitemap.ts` vs. `app/services/management/page.tsx`. | Corregir la ruta, agregar artículos y devolver `updatedAt`/`publishedAt`. |
| 5 | 🟠 | SEO en todo el sitio | **19 páginas no tienen `metadata`** (portada, aboutUs, ourTeam, blog, artículos, tasación, publicar, vender, arrendar, administración, testimonios…); todas comparten el mismo título. Los artículos del blog se cargan solo en el navegador (`'use client'` + `useEffect`), sin título ni imagen para compartir. | Revisión de cada `page.tsx`. | `generateMetadata` en servidor, sobre todo en artículos y páginas institucionales. |
| 6 | 🟠 | Login (`/api/auth/login`) | **Registra en el log del servidor la respuesta completa del login, con los tokens**, y la devuelve al navegador aunque el cliente no la usa. | `app/api/auth/login/route.ts:39` (`console.log('…payload:', payload)`) y `data: payload`. | Quitar el log y no devolver tokens. |
| 7 | 🟡 | Login | **Cada ingreso hace dos llamadas de login** (`/auth/sign-in` y luego `/auth/community/sign-in` por NextAuth), así que el límite de 10 intentos/min se consume el doble. Si el segundo falla (p. ej. cuenta staff) el mensaje es "Error al establecer la sesión". | `providers.tsx:57-80` + `lib/auth.ts`. | Una sola llamada (NextAuth) y mensajes distintos para 401 / 403 / 429. |
| 8 | 🟡 | Portada | `?page=abc` envía `NaN` a la API (`parseInt(page)` sin guarda) y la lista queda vacía. En `url-sync.ts` el operador por defecto de dormitorios/baños tiene dos ramas iguales (`>= 4 ? 'gte' : 'gte'`), señal de lógica a medio hacer. Sin `<h1>` cuando no hay destacadas. | `app/page.tsx:60`, `url-sync.ts:38-39`. | Guarda `|| 1`; decidir el operador por defecto; un `<h1>` siempre. |
| 9 | 🟡 | Menú principal | **Los ítems del menú son `<button>` con `router.push`, no enlaces.** Los buscadores no los siguen, no se pueden abrir en otra pestaña y el lector de pantalla los anuncia como botones. El pie sí usa enlaces. | `NavBar.tsx:70-84`, `PortalTopBar.tsx:212-228`. | `<Link href>` para los ítems con `href`; botón solo para "Contacto". |
| 10 | 🟡 | Estructura | Sin `not-found.tsx`, `error.tsx` ni `global-error.tsx` en todo el portal: un error de servidor muestra la pantalla por defecto de Next. | `find app -name error.tsx` vacío. | Agregar las tres con el estilo del portal. |
| 11 | 🟡 | Botón WhatsApp | Es un `<div onClick>` (no se alcanza con teclado) y vuelve a pedir la identidad al servidor aunque el layout ya la tiene. El número se arma solo con dígitos: si el teléfono no incluye el código de país, el enlace falla. | `app/ui/Wsp.tsx`. | `<a href="https://wa.me/…">`, reutilizar la identidad del layout, normalizar a +56. |
| 12 | 🟡 | Ficha | Dos `<main>` anidados (el del layout y el de `PropertyDetailClient`); `console.log` de la propiedad completa en cada visita; "relacionadas" se piden desde el navegador con `cache: 'no-store'`. | `PropertyDetailClient.tsx`, `actions.ts`. | `<div>` interno, quitar logs, pedir relacionadas en servidor. |
| 13 | 🟡 | Tasación | Espera artificial de 3 s tras recibir el resultado "por experiencia de usuario". `predict/property-value` es público y desde el portal no reenvía la IP del visitante, por lo que queda sin límite. | `valuation/page.tsx:377-383`, `predict.action.ts`. | Quitar la espera; reenviar `x-client-ip` y limitar el endpoint. |
| 14 | 🟡 | Formularios de captación | `sell-property`, `rent-property`, `publish` y `valuation` (600–900 líneas cada uno) repiten la misma lógica de pasos, regiones y publicación; ninguno enlaza la política de privacidad ni pide aceptación. | tamaños y `grep privacidad`. | Extraer a un componente común; casilla de aceptación (ver #17). |
| 15 | 🟡 | Mis propiedades | El encabezado del archivo promete "editar o eliminar", pero la pantalla solo lista. El cliente no puede retirar ni corregir una solicitud. Los controles de acceso de contratos, pagos, favoritos y propiedades por usuario **sí están bien** (se verificaron en `contracts.controller.ts` y `gridByUser`). | `myProperties/page.tsx`. | Decidir si se agrega o se corrige el texto. |
| 16 | 🟡 | Blog | Estado de "no encontrado" y de error de red son lo mismo (el `catch` solo imprime en consola). | `blog/article/[id]/page.tsx`. | Distinguir 404 de error de carga. |
| 17 | 🟠 | Privacidad | **La política tiene dos frases** y solo habla de cookies. El sitio recoge nombre, correo, teléfono, dirección y fotos de propiedades, los guarda y los envía por correo (Resend). Falta responsable del tratamiento, finalidad, plazo de conservación y cómo ejercer derechos (Ley 19.628 y la nueva Ley 21.719). Ningún formulario pide aceptarla. | `app/privacidad/page.tsx`. | Redactar la política con el cliente y agregar la casilla en los formularios. Es un tema legal, no solo de código. |
| 18 | 🟡 | Código muerto | `src/features/contact/` (formulario, hooks, servicio y acción) no está en ninguna ruta; el servicio llama a `/contact`, que no existe en core. El contacto real usa `ContactDialog`. Hay además `propertyTypesFeatures.action.ts` con respaldo `localhost:3001` (el resto usa `env.backendApiUrl`), `getPublishedPropertyPublic` duplicada (llama a `/properties/public/:id`, que no existe) y acciones de administración (`documentTypes`, `persons`, verificación) en el portal. | `grep` de usos. | Eliminar; unificar la URL base. |
| 19 | 🟡 | Registro en consola | **85 `console.log`** en el portal (login, notificaciones, publicación, favoritos) y archivos de notas sueltos en la raíz (`cookies.txt`, `ICON_LOADING_FIX.md`, `PHASE3_LAZY_IMAGE.md`…). | `grep`. | Quitar los logs con datos; mover o borrar las notas. |

## Lo que está bien

- Contratos: el cliente solo ve y sube comprobantes de **sus** contratos, y el pago debe pertenecer al contrato (`assertCommunityOwnsContract`, `paymentRepository.findOne({ id, contractId })`).
- `/properties/:id/full` y `/properties/public` ya entregan solo campos públicos y solo propiedades publicadas.
- Recuperación de contraseña y reenvío de verificación no revelan si el correo existe.
- Los artículos inactivos no se sirven a visitantes.
- JSON-LD de la ficha está escapado (corregido en `d304b58`); formularios y login reenvían la IP del visitante.
- Páginas privadas (`/favorites`, `/myProperties`, `/notifications`, `/personalInfo`) están fuera de `robots.txt`; solo `/myContracts` y `/personalInfo` se protegen en el middleware, las demás redirigen desde el cliente.

## Prioridad sugerida

1. **#1** (datos internos en respuestas públicas) y **#3** (interés en propiedad): cierran fuga de datos y suplantación.
2. **#6** (tokens en logs), **#2**, **#4**, **#5**: pequeños y de alto efecto en SEO y seguridad.
3. **#17** requiere definir el texto con el cliente.
4. El resto son mejoras y limpieza.

## Pendiente de confirmar con el stack encendido

- #1: pedir `published/filtered`, `public/featured` y `related/:id` y buscar `internalNotes`, `changeHistory`, `creatorUserId`.
- #3: llamar a `property-interest` con un `interestedUserId` ajeno.
- Móvil (375 px) y rendimiento: no se revisaron en ejecución.

# Plan de revisión del backoffice — sección por sección

> **Objetivo:** revisar cada sección del backoffice (https://admin.bravoshottpropiedades.cl) con el mismo método, dejar registro de lo encontrado y decidir qué se corrige en garantía, qué es mejora y qué queda como deuda.
>
> **Alcance:** las 26 pantallas del menú lateral, más login, PWA y una página de desarrollo, agrupadas en 7 bloques. No incluye el portal público ni la API, salvo cuando una pantalla depende de ellas.

---

## 1. Método

### 1.1 Entorno

| Elemento | Valor |
|---|---|
| Base de datos | MySQL local en Docker (`re-qa-mysql`, puerto 3307) con `npm run seed --prefix core` |
| Servicios | core `:8000`, backoffice `:8002` (y portal `:8001` cuando la sección afecta al sitio) |
| Usuarios de prueba | Un **ADMIN** y un **AGENTE** del seed. Credenciales en el seed, nunca en este documento |
| Pantallas | Escritorio (1440 px) y móvil (375 px) |
| Correo | Mailpit local (`npm run mail:dev`) |

### 1.2 Lo que se revisa en cada sección

Cada sección se recorre con esta lista. Una casilla sin marcar es un hallazgo.

| # | Eje | Qué se comprueba |
|---|---|---|
| A | **Funcional** | Cada acción de la pantalla (crear, editar, borrar, filtrar, exportar) hace lo que dice y persiste al recargar |
| B | **Reglas de negocio** | Validaciones y estados coherentes con el proceso real; los errores de la API se muestran en español y sin texto técnico |
| C | **Permisos** | El AGENTE ve y puede hacer solo lo que le corresponde; la API también lo impide (probar la llamada directa, no solo la UI) |
| D | **Datos** | Los listados paginan, ordenan y filtran bien; la exportación a Excel trae las mismas filas que la grilla |
| E | **Estados vacíos y errores** | Sin datos, con la API caída o con un error de validación, la pantalla lo explica y no queda en blanco |
| F | **Móvil** | Se puede usar en 375 px: sin desbordes, botones alcanzables, diálogos con scroll |
| G | **Consistencia visual** | Etiquetas fijas en selectores, textos, colores y espaciado según `@realestate/ui` |
| H | **Rendimiento** | La pantalla carga en menos de 2 s con el seed; sin peticiones repetidas ni errores en consola |

### 1.3 Registro de hallazgos

Cada hallazgo se anota en la tabla de su sección con:

- **Severidad:** 🔴 bloquea o expone datos · 🟠 error funcional con alternativa · 🟡 visual o menor.
- **Tipo:** `garantía` (defecto de algo entregado), `mejora` (cambia el alcance) o `deuda` (técnico, sin efecto visible).
- **Evidencia:** pasos, resultado obtenido y esperado, y captura si aplica.

### 1.4 Criterio de cierre de una sección

Una sección queda **revisada** cuando:
1. Se recorrieron los ocho ejes con ADMIN y con AGENTE.
2. Todos los 🔴 están corregidos y los 🟠 tienen decisión (corregir ahora o fecha).
3. Las correcciones tienen test (core) o verificación en navegador (UI).

---

## 2. Orden de revisión

Se prioriza por **riesgo** (dinero, datos personales, permisos) y por **uso diario**.

| Orden | Bloque | Secciones | Riesgo | Estado |
|---|---|---|---|---|
| 1 | Contratos | Compraventa, Arriendo | Dinero y estado de propiedades | 🟢 Lógica corregida (`55e3217`); falta recorrido de UI |
| 2 | Personas y documentos | Personas, Documentos, Tipos de documento | Datos personales | 🟢 Seguridad corregida (`97dcb89`); falta recorrido de UI |
| 3 | Propiedades | Venta, Arriendo, Tipos de propiedad | Publicación en el portal | 🟡 Publicación y multimedia corregidas (`5ad6fce`, `19b6cac`); faltan puntos 4–5 del análisis |
| 4 | Usuarios | Administradores, Agentes, Comunidad | Accesos | 🟢 Revisado; críticos y altos corregidos — quedan #4 (decisión) y menores ([informe](./revision-backoffice/04-usuarios.md)) |
| 5 | Dashboard y reportes | Dashboard, Reportes | Decisiones con datos erróneos | 🟢 Revisado; críticos y altos corregidos — quedan #6 (decisión) y menores ([informe](./revision-backoffice/05-dashboard-reportes.md)) |
| 6 | CMS | 11 pantallas | Imagen pública | 🟢 Revisado; XSS corregido — quedan #2–#3 (decisión de permisos) y menores ([informe](./revision-backoffice/06-cms.md)) |
| 7 | Sistema | Notificaciones, Acerca de, Login, PWA | Accesos | 🟢 Revisado; críticos y altos corregidos — quedan menores ([informe](./revision-backoffice/07-sistema.md)) |

**Estimación total:** 6–8 jornadas de revisión, más el tiempo de las correcciones que surjan.

---

## 3. Secciones

### Bloque 1 — Contratos

#### 3.1 Contratos de compraventa (`/contracts/sales`, `/contracts/sales/[id]`)

| Proceso | Qué revisar |
|---|---|
| Crear (asistente de 6 pasos) | Propiedad y agente; precio en CLP/UF con valor UF; comisión de comprador y vendedor; pagos programados; documentos requeridos |
| Detalle | Partes, pagos con su moneda, documentos, historial |
| Agregar pago / persona | Moneda por defecto correcta (comisiones en CLP) |
| Cerrar / marcar fallido | Mensajes de las reglas nuevas; la propiedad cambia a Vendida o vuelve a Publicada |
| Grilla y Excel | Filtros por estado, propiedad, fechas |

**Ya resuelto:** estado de la propiedad, transiciones, un contrato activo por propiedad, moneda de pagos, pagos en tabla.
**Pendiente conocido:** el cierre reemplaza todos los documentos (§ evaluación de contratos, punto 8); etapas de promesa/escritura (mejora).

#### 3.2 Contratos de arriendo (`/contracts/rent`, `/contracts/rent/[id]`)

| Proceso | Qué revisar |
|---|---|
| Crear | Arriendo mensual, moneda, depósito, duración, fecha de inicio; cronograma generado (inicio el 31 → fin de mes) |
| Detalle | Inicio y duración visibles; pagos en UF mostrados como UF |
| Pagos informados por el cliente | Flujo `PENDING_VERIFICATION` → `PAID` desde el portal |
| Error al crear | Mensaje cuando la propiedad ya tiene contrato en proceso |

**Pendiente conocido:** avisos de cuotas vencidas, reajuste IPC, término anticipado (mejoras).

### Bloque 2 — Personas y documentos

#### 3.3 Personas (`/contracts/persons`, `/contracts/persons/[id]`)

| Proceso | Qué revisar |
|---|---|
| Crear / editar | RUT en cualquier formato se guarda como `12345678-K`; duplicado muestra "Ya existe una persona con ese RUT" |
| Eliminar y recrear | Recrear con el mismo RUT restaura la ficha |
| Carnet frente/reverso | Subida, vista previa, reemplazo |
| Verificación | Solicitar, verificar, quitar; la solicitud se limpia |
| Vincular / desvincular usuario | Rechaza usuario con otra ficha |

**Pendiente conocido:** validar dígito verificador; impedir borrar personas con contratos activos; carnets en bucket público (decisión).

#### 3.4 Documentos (`/contracts/documents`)

| Proceso | Qué revisar |
|---|---|
| Crear con y sin archivo | Tipos permitidos, tamaño, título |
| Cambiar estado | Pendiente → Subido → Recibido / Rechazado |
| Eliminar | Bloqueado en contratos cerrados o fallidos |
| Filtros y Excel | Por persona, contrato, tipo, estado |

**Pendiente conocido:** flujo de revisión (quién, motivo de rechazo, aviso al cliente); endpoints de subida sin uso.

#### 3.5 Tipos de documento (`/contracts/documentTypes`)

Crear, editar, disponibilidad, borrar. Verificar que **no se puedan renombrar** "DNI Frontal" y "DNI Trasero" (la subida de carnets los busca por nombre).

### Bloque 3 — Propiedades

#### 3.6 Propiedades en venta y en arriendo (`/properties/sales`, `/properties/rent`, `/[id]`)

| Proceso | Qué revisar |
|---|---|
| Crear (asistente de 6 pasos) | Validaciones por paso; cola de subida con progreso; MOV rechazado |
| Ficha por secciones | Información básica, características, ubicación, multimedia, SEO, notas, historial: cada una guarda sola |
| Estados y agente | Exigir agente para publicar; notificación al agente asignado |
| Vaciar campos | Quitar agente, borrar descripción o notas (hoy **no se puede**: punto 4 del análisis de publicación) |
| Transiciones de estado | Hoy cualquier estado pasa a cualquier otro (punto 5) |
| Grilla, filtros, Excel, compartir por correo | |

**Pendiente conocido:** puntos 4–9 del análisis de publicación (vaciar campos, transiciones, agentes editando cualquier propiedad, códigos duplicados en concurrencia).

#### 3.7 Tipos de propiedad (`/properties/propertyTypes`)

Crear, editar, características asociadas, borrar con propiedades que lo usan.

### Bloque 4 — Usuarios

#### 3.8 Administradores (`/users/administrators`) — solo ADMIN

| Revisar | Detalle |
|---|---|
| Permisos | El AGENTE no ve el menú **ni** puede llamar a la API |
| Alta y edición | Contraseña inicial, correo único, rol |
| Desactivar | Verificar que no se pueda desactivar al último administrador ni a uno mismo |

#### 3.9 Agentes (`/users/agents`)

Alta, edición (el avatar no se pierde: corregido en `fd3e02f`), estados Activo / Vacaciones / Licencia / Inactivo, efecto de desactivar un agente con propiedades asignadas.

#### 3.10 Comunidad (`/users/community`, `/[id]`)

Listado, ficha del cliente, propiedades y contratos asociados, bloqueo de cuenta. Revisar que solo se muestren datos necesarios (datos personales).

### Bloque 5 — Dashboard y reportes

#### 3.11 Dashboard (`/`)

| Revisar | Detalle |
|---|---|
| KPIs | Coinciden con las grillas (contar a mano con el seed) |
| Ingresos | **Mezcla UF y CLP** desde antes del cambio de moneda por pago: verificar que ahora se separen o conviertan |
| Ranking de agentes, distribución, comparación | Periodos y filtros |
| Móvil | Tarjetas KPI legibles (corregido APP-09) |

#### 3.12 Reportes (`/reports`) — solo ADMIN

Mismos controles de exactitud; exportación; permisos (el AGENTE no accede vía API).

### Bloque 6 — CMS

Para cada pantalla: **guardar → abrir el portal → ver el cambio** (la configuración se cachea hasta 5 min).

| # | Pantalla | Qué revisar en particular |
|---|---|---|
| 3.13 | Slider | Imágenes y video, orden, slide móvil vs escritorio, compresión |
| 3.14 | Sobre nosotros | Texto largo, imagen/video, justificado en móvil (APP-12) |
| 3.15 | Nuestro equipo | Fotos, orden, miembros inactivos |
| 3.16 | Testimonios | Avatar, aprobación, visibilidad |
| 3.17 | Artículos de blog | Crear con etiquetas fijas en selectores, imagen OG (JPEG), publicar/despublicar |
| 3.18 | Identidad de la empresa | Guardado por secciones, logo, redes, alianzas, FAQ (ocultas si vacías, APP-16), nombre en correos |
| 3.19 | Top Bar | Menú, enlaces externos, orden |
| 3.20 | Footer | Enlaces, contacto |
| 3.21 | Listados | Clásico vs sidebar v2; efecto en portada y venta/arriendo |
| 3.22 | Destacadas | Se ocultan sin destacadas publicadas |
| 3.23 | Paleta de colores | Contraste suficiente (texto sobre botones) |

### Bloque 7 — Sistema

| # | Pantalla | Qué revisar |
|---|---|---|
| 3.24 | Notificaciones | Tiempo real (WebSocket), marcar leída, enlaces al recurso |
| 3.25 | Acerca de | Versión y datos de contacto vigentes |
| 3.26 | Login | Errores claros, bloqueo tras intentos, redirección por rol, `NEXTAUTH_URL` correcto |
| 3.27 | PWA y sin conexión (`/~offline`) | Instalación, página sin conexión, service worker solo en producción |
| 3.28 | `/test-colors` | **Página de desarrollo expuesta**: decidir si se elimina |

---

## 4. Plantilla de informe por sección

```markdown
### <Sección> — revisada el <fecha> por <nombre>

| Eje | Resultado |
|---|---|
| A Funcional | ✅ / ❌ |
| B Reglas | |
| C Permisos | |
| D Datos | |
| E Vacíos y errores | |
| F Móvil | |
| G Visual | |
| H Rendimiento | |

| # | Severidad | Tipo | Hallazgo | Evidencia | Decisión |
|---|---|---|---|---|---|
| 1 | 🟠 | garantía | ... | pasos / captura | corregir |
```

---

## 5. Entregables

1. Este plan con la columna **Estado** actualizada al cerrar cada bloque.
2. Un informe por bloque (plantilla §4), en `doc/revision-backoffice/`.
3. Commits de corrección referenciando la sección (p. ej. `fix(backoffice/usuarios): …`).
4. Resumen final para el cliente: qué se corrigió en garantía y qué queda como propuesta de mejora.

## Documentos relacionados

- [Documentación del proyecto](./documentacion-proyecto/README.md)
- [Listado de correcciones UI móvil](./LISTADO_CORRECCIONES_UI_MOBILE.md)
- [Roadmap de mejoras](./ROADMAP_MEJORAS.md)
- [Acta de entrega](./ACTA_DE_ENTREGA.md) — define qué es garantía y qué es mejora

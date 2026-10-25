# Bloque 6 — CMS: revisado el 25-10-2026

> Secciones (11): Slider, Sobre nosotros, Nuestro equipo, Testimonios, Artículos, Identidad, Top Bar, Footer, Listados, Destacadas, Paleta de colores.
> Método: [Plan de revisión §1](../PLAN_REVISION_BACKOFFICE.md). Entorno local con portal, backoffice y API; permisos probados por API con ADMIN, AGENTE y anónimo; cambio de Identidad seguido hasta el portal.

## Resumen

| Eje | Resultado | Nota |
|---|---|---|
| A Funcional | ✅ | Las 11 pantallas cargan y guardan |
| B Reglas | ⚠️ | El portal tarda hasta 5 min en mostrar cambios y el backoffice no lo avisa |
| C Permisos | ❌ | Reglas distintas entre pantallas: el agente edita y borra Identidad, Slider, Equipo, Testimonios, Nosotros y Blog, pero no Top Bar, Footer, Listados, Destacadas ni Paleta |
| D Datos | ✅ | Lo guardado coincide con lo que entrega la API |
| E Vacíos y errores | ⚠️ | El agente ve en el menú pantallas que al guardar responden 403 |
| F Móvil | ✅ | Formularios de Identidad y Paleta usables a 375 px |
| G Visual | ✅ | Consistente; la Paleta tiene vista previa del portal |
| H Rendimiento | ✅ | Sin problemas |

**Portal (relacionado):** se encontró un **XSS almacenado** en la ficha de propiedad (hallazgo #1). No es de una pantalla del CMS, pero afecta al contenido público y se detectó revisando cómo el portal muestra el contenido.

## Hallazgos

| # | Sev. | Tipo | Hallazgo | Evidencia | Decisión / estado |
|---|---|---|---|---|---|
| 1 | 🔴 | garantía | **XSS almacenado en la ficha de propiedad del portal.** Los datos estructurados (JSON-LD) se insertan con `JSON.stringify` dentro de `<script>` sin escapar `<`. Un título con `</script><script>…` ejecuta código en el navegador de cada visitante. Los títulos pueden llegar desde el formulario público anónimo. | Título de prueba `QA </script><script>window.__xss=1</script>`: el HTML del portal lo incluye tal cual y en el navegador `window.__xss === 1`. | ✅ **Corregido:** `serializeJsonLd` escapa `<`, `>`, `&` y U+2028/9; test en `portal/tests/json-ld.node.test.mjs`. Verificado: el mismo título ya no ejecuta código y el JSON-LD sigue válido |
| 2 | 🟠 | mejora | **Permisos del CMS inconsistentes.** El agente puede editar y **borrar** la Identidad de la empresa (nombre, logo, contacto), slides, equipo, testimonios, Nosotros y artículos; en cambio Top Bar, Footer, Listados, Destacadas y Paleta son solo ADMIN. | Agente: `PATCH /identities/:id` 200; `PATCH /portal-header` 403; `PATCH /appearance` 403. | **Confirmar con el cliente** qué puede editar un agente. Propuesta: Identidad solo ADMIN; Blog y Testimonios para agentes |
| 3 | 🟠 | garantía | **El agente ve en el menú pantallas que no puede usar** (Top Bar, Footer, Listados, Destacadas, Paleta): las abre y al guardar recibe 403. | Menú del backoffice con sesión de agente; API 403. | Ocultar en el menú lo que el rol no puede guardar (según la decisión de #2) |
| 4 | 🟡 | garantía | **Los cambios tardan hasta 5 min en verse en el portal** (caché de Identidad, Top Bar, Footer, Listados y Paleta) y el backoffice dice "guardado" sin aclararlo. | Teléfono cambiado: la API lo entrega al instante; el portal muestra el anterior pasados 20 s. | Avisar en el mensaje de guardado, o invalidar la caché del portal al guardar (`revalidateTag` mediante un endpoint protegido) |
| 5 | 🟡 | garantía | **Las URL de redes sociales no se validan** (se acepta cualquier texto). React 19 bloquea los enlaces `javascript:`, así que el riesgo es bajo, pero un enlace mal escrito queda roto en el footer. | `CreateIdentityDto`/`UpdateIdentityDto` sin `IsUrl`. | Validar `http(s)://` |

**Nota del entorno:** las imágenes de Slider, Nosotros, Testimonios y Artículos no se ven en local porque `BACKEND_PUBLIC_URL` del `core/.env` local apunta a otro servidor; no es un defecto del CMS.

## Prioridad de corrección

1. **#1** (🔴): corregir de inmediato; es un cambio de una línea con test.
2. **#2 y #3**: decidir con el cliente los permisos del agente y ajustar API y menú juntos.
3. **#4 y #5**: menores.

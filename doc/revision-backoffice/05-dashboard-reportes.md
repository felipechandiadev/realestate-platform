# Bloque 5 — Dashboard y reportes: revisado el 25-10-2026

> Secciones: Dashboard (`/`) y Reportes (`/reports`, solo ADMIN).
> Método: [Plan de revisión §1](../PLAN_REVISION_BACKOFFICE.md). Entorno local (MySQL Docker + seed), con ADMIN y AGENTE, escritorio y móvil. Se insertaron pagos de prueba (12 UF y $450.000) para comprobar los totales y luego se borraron.

## Resumen

| Eje | Resultado | Nota |
|---|---|---|
| A Funcional | ❌ | El ranking de agentes y el reporte de agentes salen **siempre vacíos** por un error en la consulta |
| B Reglas | ❌ | Los ingresos suman UF como si fueran pesos; el "tiempo promedio de venta" usa la fecha de última edición e incluye arriendos |
| C Permisos | ⚠️ | Reportes bien restringidos a ADMIN; el dashboard muestra los ingresos de la corredora a los agentes |
| D Datos | ❌ | Variaciones "vs mes anterior" fijas en 0 %; la comparación "mismo mes año anterior" muestra el mes anterior |
| E Vacíos y errores | ⚠️ | Ranking vacío sin mensaje; línea de depuración visible ("Diagnóstico: …") |
| F Móvil | ✅ | Tarjetas KPI legibles y apiladas |
| G Visual | ✅ | Consistente con el resto |
| H Rendimiento | 🟡 | La tendencia de 6 meses hace 6 consultas seguidas y el ranking una por agente; aceptable con el volumen actual |

**Lo que está bien:** el reporte de **contratos** separa montos en UF y CLP; los reportes de propiedades y geográfico devuelven datos coherentes; el agente recibe 403 en todos los reportes y el menú los oculta; la distribución por tipo de propiedad es correcta.

## Hallazgos

| # | Sev. | Tipo | Hallazgo | Evidencia | Decisión / estado |
|---|---|---|---|---|---|
| 1 | 🔴 | garantía | **Ranking de agentes y reporte "Agentes" siempre vacíos.** El cálculo por agente une `contract.property`, una relación que la entidad de contrato no tiene; cada agente falla y se descarta en silencio. | Log: `TypeORMError: Relation with property path property in entity was not found` por cada agente; `/analytics/agents` = `[]`; reporte Agentes = 0 filas; `/analytics/agents/:id` = 500. | ✅ **Corregido:** unión por `contract.propertyId` y `GROUP BY` faltante (oculto tras el primer error). Ranking, reporte de agentes y `/analytics/agents/:id` funcionan |
| 2 | 🔴 | garantía | **Ingresos mezclan UF y CLP.** El total del mes y la tendencia suman `amount` sin mirar la moneda: 12 UF cuentan como $12. | Con 12 UF + $450.000 pagados hoy, el total fue **$450.012** (debería rondar $918.000 con UF ≈ $39.000). | ✅ **Corregido:** pagos en UF convertidos con el valor UF del contrato. Verificado: 12 UF + $450.000 = **$918.000** |
| 3 | 🟠 | garantía | **"vs mes anterior" siempre 0 %.** Las cuatro tarjetas tienen la variación fija en 0 en el código. | `page.tsx`: `variation: 0` en todas. | ✅ **Corregido:** variación real contra el mes anterior en ingresos y nuevos miembros; las tarjetas sin base de comparación ya no muestran la línea |
| 4 | 🟠 | garantía | **"Mismo mes año anterior" muestra el mes anterior.** El backend no envía ese dato y el front usa el mes anterior con la etiqueta del año anterior. | `page.tsx`: `previousYearSameMonth ?? revenueData[n-2]`. | ✅ **Corregido:** el backend calcula el mismo mes del año anterior |
| 5 | 🟠 | garantía | **"Tiempo promedio de venta" mal calculado:** usa `updatedAt − createdAt` (cualquier edición lo cambia) e incluye arriendos. | `getGlobalAverageClosureDays`. | ✅ **Corregido:** días desde la creación hasta `endDate`, solo compraventas cerradas |
| 6 | 🟠 | mejora | **El agente ve los ingresos de la corredora** en el dashboard (el endpoint `/analytics/summary` es ADMIN y AGENT). | Captura con sesión de agente. | **Confirmar con el cliente**; si no corresponde, ocultar ingresos al agente o mostrarle solo sus métricas |
| 7 | 🟡 | garantía | **Línea de depuración en pantalla:** "Diagnóstico: 0 pago(s) reconocidos como ingreso…". | Captura del dashboard. | ✅ **Corregido:** línea eliminada |
| 8 | 🟡 | garantía | **Ranking sin estado vacío:** cuando no hay datos la tarjeta queda en blanco. | Captura. | ✅ **Corregido:** mensaje "Aún no hay agentes con propiedades asignadas" |
| 9 | 🟡 | garantía | **Ranking ordena por contratos cerrados pero muestra la tasa de conversión**, que además se calcula sobre propiedades asignadas actuales. | `page.tsx` y `get-agent-performance`. | ✅ **Corregido:** ordena por la conversión que muestra (desempate por cierres) y lo explica bajo el título |
| 10 | 🟡 | deuda | **`/analytics/geographic` responde 500** (relación `state` inexistente). Ningún front lo usa; el reporte geográfico usa otra consulta y funciona. | Log: `Relation with property path state … not found`. | ✅ **Corregido:** endpoint eliminado (no lo usaba ningún front) |
| 11 | 🟡 | deuda | **"Valor de contratos" por agente también suma UF y CLP** (`getTotalContractValue`). | Código. | ✅ **Corregido** junto con #2 (valor de contratos por agente en CLP) |

## Correcciones aplicadas

Hallazgos 1, 2, 3, 4, 5, 7 y 11 corregidos, con tests (`dashboard-math.spec.ts`, `analytics-queries.spec.ts`) y verificados contra MySQL y en el navegador. Si un contrato en UF no tiene `ufValue`, sus pagos en UF cuentan 0 en los ingresos: el formulario lo exige al crear, pero conviene revisarlo en datos antiguos. Pendientes: #6 (decisión del cliente), #8, #9 y #10.

## Prioridad de corrección (original)

1. **#1 y #2** (🔴): hoy el dashboard muestra un ranking vacío e ingresos incorrectos en cuanto hay contratos en UF.
2. **#3, #4, #5**: los indicadores dicen algo distinto de lo que calculan.
3. **#6**: decisión del cliente.
4. **#7 a #11**: menores y limpieza.

## Nota del entorno

Durante la prueba el servidor de desarrollo del backoffice entró en un bucle de recompilación (Fast Refresh) que recargaba `/login` continuamente; se resolvió reiniciándolo. Es un problema del modo desarrollo, no del sitio en producción.

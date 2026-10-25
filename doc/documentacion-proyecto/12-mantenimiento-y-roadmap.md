# 12 · Mantenimiento, limitaciones y hoja de ruta

## 12.1 Mantenimiento recomendado

| Frecuencia | Tarea |
|---|---|
| Diaria | Verificar respaldo de BD |
| Semanal | Revisar `pm2 logs` y el panel de Resend (rebotes, límites) |
| Mensual | Actualizaciones de seguridad del sistema operativo; revisar uso de disco y R2 |
| Trimestral | Actualizar dependencias (`npm outdated`, `npm audit`) en una rama, probar y desplegar |
| Anual | Renovar dominio; revisar planes de Resend, R2 y VPS |

## 12.2 Limitaciones conocidas

- **Correo sin cola ni reintentos**: si Resend falla o se alcanza el límite, el correo se pierde (queda en el log).
- **Sin pasarela de pago**: los pagos se registran manualmente o los informa el cliente.
- **Sin integración con portales externos** (Portal Inmobiliario, Yapo, etc.).
- **Tema claro únicamente**.
- **Estimación de valor basada en reglas**, no en un modelo de mercado: es orientativa.
- Caché de configuración del CMS de hasta 5 minutos.
- Algunos ajustes de interfaz móvil pendientes: ver [Correcciones UI móvil](../LISTADO_CORRECCIONES_UI_MOBILE.md).

## 12.3 Hoja de ruta sugerida

Detalle en [ROADMAP_MEJORAS.md](../ROADMAP_MEJORAS.md). Principales líneas:

1. Cola de correos con reintentos y migración a la API de Resend (rebotes).
2. Pruebas automáticas de frontend (flujos críticos).
3. Integración con portales inmobiliarios.
4. Pagos en línea.
5. Reportes exportables (Excel/PDF).

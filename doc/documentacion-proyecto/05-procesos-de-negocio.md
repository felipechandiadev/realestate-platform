# 05 · Procesos de negocio y ciclos de vida

## 5.1 Ciclo de vida de una propiedad

```
REQUEST ──► PRE-APPROVED ──► PUBLISHED ──► CONTRACT-IN-PROGRESS ──► SOLD / RENTED
   │                            │
   └──────────► INACTIVE ◄──────┘
```

| Estado | Significado | Visible en portal |
|---|---|---|
| `REQUEST` | Solicitud recibida desde el portal | No |
| `PRE-APPROVED` | Revisada por la corredora, en preparación | No |
| `PUBLISHED` | Publicada | **Sí** |
| `CONTRACT-IN-PROGRESS` | Con contrato en curso | No |
| `SOLD` / `RENTED` | Vendida / arrendada | No |
| `INACTIVE` | Retirada o descartada | No |

Cada cambio de estado notifica por correo al solicitante y queda en el historial.

Operación: `SALE` (venta) o `RENT` (arriendo). Moneda del precio: `CLP` o `UF`.

## 5.2 Proceso: captación → publicación

1. El propietario completa *Publicar* o *Vender/Arrendar* en el portal → propiedad `REQUEST`.
2. Los admins reciben notificación y correo.
3. Un admin revisa, asigna agente y completa la ficha → `PRE-APPROVED`.
4. Se cargan fotos, ubicación y SEO → `PUBLISHED`.
5. Opcional: marcar como destacada para la portada.

## 5.3 Proceso: lead → contrato

1. Un visitante envía interés desde la ficha → aviso al admin y al agente.
2. El agente gestiona la visita y la negociación.
3. Se crea el **contrato** (compraventa o arriendo) con sus personas y roles → la propiedad pasa a `CONTRACT-IN-PROGRESS`.
4. Se cargan documentos y se registran pagos.
5. Cierre: contrato `CLOSED` → propiedad `SOLD` o `RENTED`. Si se cae: `FAILED`.

## 5.4 Contratos

| Concepto | Valores |
|---|---|
| Tipo | `COMPRAVENTA`, `ARRIENDO` |
| Estado | `IN_PROCESS`, `CLOSED`, `FAILED` |
| Moneda | `CLP`, `UF` |
| Roles de personas | Vendedor, comprador, arrendador, arrendatario, notario, conservador, testigo, aval, representante, promitente, tercero, agente |

Cada contrato tiene un código correlativo y puede tener múltiples documentos.

## 5.5 Pagos

| Tipo | Uso |
|---|---|
| `RENT_PAYMENT` | Arriendo mensual |
| `DEPOSIT` | Garantía |
| `SALE_DOWN_PAYMENT` · `SALE_INSTALLMENT` · `SALE_FINAL_PAYMENT` | Pie, cuotas y pago final de una venta |
| `COMMISSION_INCOME` | Comisión de la corredora |
| `MAINTENANCE_FEE` · `UTILITIES` · `OTHER` | Gastos comunes, servicios y otros |

Estados: `PENDING` → `PENDING_VERIFICATION` (el cliente informó el pago) → `PAID`, o `CANCELLED`. El cliente ve sus pagos en *Mis contratos*. La plataforma **registra** pagos; no cobra en línea.

## 5.6 Notificaciones y correos

Los eventos relevantes generan notificaciones en la plataforma (en tiempo real) y, según el caso, un correo. El detalle de cada correo está en [Correo transaccional §5](../CORREO_TRANSACCIONAL.md).

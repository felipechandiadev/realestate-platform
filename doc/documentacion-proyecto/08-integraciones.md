# 08 · Integraciones y servicios externos

| Servicio | Uso | Dónde se configura | Qué pasa si falla |
|---|---|---|---|
| **Cloudflare R2** | Almacenamiento de fotos, documentos y piezas del CMS (compatible S3) | `R2_*` en `core/.env`; host público en `next.config.ts` | No se suben ni muestran imágenes nuevas |
| **Resend** (SMTP) | Correos transaccionales | `MAIL_*` en `core/.env` | No salen correos (verificación, recuperación, avisos) |
| **Let's Encrypt** | Certificado HTTPS | certbot en el servidor | El sitio muestra error de certificado al vencer |
| **Proveedor del valor UF** | Mostrar la UF del día | Portal | Solo desaparece el valor; el sitio sigue |
| **Mapas** | Mapa en la ficha y en el formulario de ubicación | Portal / backoffice | No se ve el mapa |
| **WhatsApp** | Botón de contacto | Número en el CMS | — |

## 8.1 Cuentas que debe controlar el cliente

| Cuenta | Recomendación |
|---|---|
| Cloudflare (R2 y, si aplica, DNS) | A nombre del cliente, con el desarrollador como invitado |
| Resend | Ídem; rotar la API key al traspasar. Ver [Correo transaccional](../CORREO_TRANSACCIONAL.md) |
| Proveedor del VPS | A nombre del cliente |
| Dominio `bravoshottpropiedades.cl` (NIC Chile) | A nombre del cliente |
| Repositorio GitHub | Acceso de lectura o traspaso según contrato |

## 8.2 Límites a vigilar

- **Resend**: correos por día y por mes según el plan (detalle en el doc de correo).
- **R2**: almacenamiento y operaciones; el plan gratuito cubre volúmenes moderados.
- **VPS**: CPU, RAM y disco (las imágenes optimizadas se guardan en R2, no en el disco).

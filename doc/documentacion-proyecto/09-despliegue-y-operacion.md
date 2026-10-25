# 09 · Infraestructura, despliegue y operación

## 9.1 Infraestructura de producción

```
Internet ──► nginx :443 (Let's Encrypt)
               ├── bravoshottpropiedades.cl        → portal     :8001  (PM2: rlst-portal)
               ├── admin.bravoshottpropiedades.cl  → backoffice :8002  (PM2: rlst-backoffice)
               └── core.bravoshottpropiedades.cl   → API        :8000  (PM2: rlst-core)
                                                        ├── MySQL :3306 (solo localhost)
                                                        ├── Cloudflare R2
                                                        └── Resend
```

- HTTP redirige a HTTPS. MySQL no está expuesto a internet.
- Plantillas de nginx: `deploy/nginx/` y `deploy/nginx.conf.example`.

## 9.2 Variables de entorno

Los valores reales están **solo en el servidor**. Plantillas sin valores:

| Archivo en servidor | Plantilla |
|---|---|
| `core/.env` | `envs/core.env.example` |
| `portal/.env.local` | `envs/portal.env.example` |
| `backoffice/.env.local` | `envs/backoffice.env.example` |

Grupos: base de datos (`DB_*`), sesión (`JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`), URLs públicas (`PORTAL_URL`, `BACKEND_PUBLIC_URL`, `NEXT_PUBLIC_*`), archivos (`STORAGE_PROVIDER`, `R2_*`) y correo (`MAIL_*`).

> `NEXTAUTH_URL` debe ser la URL de **su propia** app (portal → dominio del portal; backoffice → `admin.`). Si se cruzan, el inicio de sesión falla.

## 9.3 Procedimiento de despliegue

Basado en `deploy/deploy.sh.example`:

```bash
git pull origin main
npm ci && npm ci --prefix core
npm run build -w portal
npm run build -w backoffice
npm run core:build
npm run migration:run:prod --prefix core   # respaldar la BD antes
pm2 restart rlst-core rlst-portal rlst-backoffice
```

Checklist posterior: abrir portal, backoffice (login) y `https://core.bravoshottpropiedades.cl/api`; revisar `pm2 logs` por errores.

## 9.4 Respaldos

| Qué | Cómo | Frecuencia recomendada |
|---|---|---|
| Base de datos | `mysqldump real_estate_platform > respaldo-AAAAMMDD.sql` (cron), copia fuera del servidor | Diaria, retener 30 días |
| Archivos | Están en R2 (redundante); opcional replicar el bucket | Semanal |
| Archivos `.env` | Copia cifrada en un gestor de contraseñas del cliente | Ante cada cambio |

**Restaurar**: `mysql real_estate_platform < respaldo.sql` y reiniciar `rlst-core`.

## 9.5 Operación diaria

| Tarea | Comando / lugar |
|---|---|
| Estado de procesos | `pm2 status` |
| Logs | `pm2 logs rlst-core` (o `rlst-portal`, `rlst-backoffice`) |
| Reiniciar | `pm2 restart <nombre>` |
| Renovar certificado | Automático con certbot; verificar `certbot renew --dry-run` |
| Correo no llega | Ver [Correo transaccional §7](../CORREO_TRANSACCIONAL.md) |

## 9.6 Problemas frecuentes

| Síntoma | Causa probable | Acción |
|---|---|---|
| 502 Bad Gateway | Proceso PM2 caído | `pm2 status`, `pm2 logs`, reiniciar |
| No se puede iniciar sesión | `NEXTAUTH_URL`/`NEXTAUTH_SECRET` incorrectos o API caída | Revisar `.env.local` y la API |
| Imágenes no cargan | Credenciales R2 o host no permitido en `next.config.ts` | Revisar `R2_*` y reconstruir |
| Cambios del CMS tardan en verse | Caché de hasta 5 minutos | Esperar o recargar |

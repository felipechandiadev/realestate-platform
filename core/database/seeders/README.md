# Seeds

| Comando | Qué hace |
|---|---|
| `npm run seed` / `seed:reset` | Seed base de Bravo Schott Propiedades: **recrea el esquema** (`synchronize(true)`) y carga usuarios, propiedades, CMS, equipo e identidad. |
| `npm run seed:demo` | Agrega ~3 meses de historial (agentes, clientes, ~58 propiedades, ~19 contratos, ~62 pagos, 70 notificaciones) para Dashboard y Reportes. Requiere el seed base y no borra nada. |
| `npm run seed:full` | `seed:reset` + `seed:demo`. |

Las fechas del historial son relativas a hoy y el generador es determinista.

## Base local recomendada

El guardia ([seed-guard.ts](seed-guard.ts)) solo deja correr contra un host local y una base que termine en `_dev`, `_test` o `_local`.

```bash
docker run -d --name bravo-mysql-dev -e MYSQL_ROOT_PASSWORD=devpass \
  -e MYSQL_DATABASE=bravo_schott_dev -p 3307:3306 mysql:8.0 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=devpass \
DB_DATABASE=bravo_schott_dev DB_SSL=false \
STORAGE_PROVIDER=local STORAGE_STRATEGY=local npm run seed:full
```

`STORAGE_PROVIDER=local` evita subir imágenes de ejemplo al bucket R2 del `.env`.
Accesos: `admin@re.cl` / `890890` (administrador), `agent1@re.cl` / `1234` (agente).

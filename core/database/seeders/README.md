# Seeds

| Comando | Qué hace |
|---|---|
| `npm run seed` / `seed:reset` | **Todo en uno:** recrea el esquema (`synchronize(true)`), carga el seed base de Bravo Schott Propiedades (usuarios, propiedades, CMS, equipo, identidad) y el historial de ~3 meses para Dashboard y Reportes (agentes, clientes, ~58 propiedades, ~19 contratos, ~62 pagos, 70 notificaciones). |
| `npm run seed:base` | Solo el seed base, sin historial. |
| `npm run seed:demo` | Solo agrega el historial a un seed base ya cargado; no borra nada. Cada propiedad demo recibe galería de 3 imágenes optimizadas. |
| `npm run seed:full` | `seed:reset` + `seed:demo`. |
| `npm run seed:media:repair` | Completa galerías de propiedades seed que no tienen multimedia y optimiza las imágenes seed heredadas, sliders y logo sin resetear tablas ni reemplazar archivos reales. |

El seed borra todas las tablas y vacía `core/public` (imágenes locales).

Las fechas del historial son relativas a hoy y el generador es determinista.

El uploader genera variantes WebP siguiendo las estrategias del flujo normal:
propiedades (thumbnail pequeño/mediano y full), sliders (mobile/desktop/thumbnail),
avatares/testimonios y logo. El logo actual de producción está en
`core/test/multimedia/multimediaSamples/images/bravo-schott-logo.png` y se asigna
a la identidad y al header del portal.

## Base local recomendada

El guardia ([seed-guard.ts](seed-guard.ts)) solo deja correr contra un host local y una base que termine en `_dev`, `_test` o `_local`.

```bash
docker run -d --name bravo-mysql-dev -e MYSQL_ROOT_PASSWORD=devpass \
  -e MYSQL_DATABASE=bravo_schott_dev -p 3307:3306 mysql:8.0 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci

DB_HOST=127.0.0.1 DB_PORT=3307 DB_USERNAME=root DB_PASSWORD=devpass \
DB_DATABASE=bravo_schott_dev DB_SSL=false \
STORAGE_PROVIDER=local STORAGE_STRATEGY=local npm run seed
```

`STORAGE_PROVIDER=local` evita subir imágenes de ejemplo al bucket R2 del `.env`.
Accesos: `admin@re.cl` / `890890` (administrador), `agent1@re.cl` / `1234` (agente).

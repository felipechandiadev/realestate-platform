# Baseline de migraciones (MySQL)

El esquema de producción **no** se construyó con migraciones: lo creó
`synchronize` de TypeORM (y los seeds). Ninguna migración crea las tablas base
(`users`, `properties`, `contracts`, …), así que **no** se puede ejecutar
`migration:run` desde cero contra producción. Este documento describe cómo
tomar una "línea base": comparar las entidades con el esquema real, revisar
las diferencias y marcar como ejecutadas las migraciones que el esquema ya
refleja, para que desde ahora **todo cambio de esquema sea una migración**.

> Reglas de oro
> - Nunca trabajes el diff contra producción: usa una **copia local** cuyo
>   nombre termine en `_dev`.
> - Haz siempre un respaldo completo antes de tocar producción.
> - `synchronize` está apagado en producción y la app **no arranca** si
>   `DB_SYNCHRONIZE=true` con `NODE_ENV=production`.
> - `migration:run`/`revert`/`generate` contra producción o un host no local
>   exigen `CONFIRM_MIGRATION=yes` y muestran host/base (nunca credenciales).

## Configuración relevante

| Elemento | Ubicación |
| --- | --- |
| Única carpeta de migraciones | `core/src/database/migrations/` (en build: `core/dist/database/migrations/*.js`) |
| DataSource de la CLI | `core/src/config/data-source.ts` (mismas variables `DB_*` que la app; `synchronize` y `migrationsRun` en `false`) |
| Política de `synchronize` | `core/src/config/database-options.ts` (`resolveSynchronize`) |
| Guardia de la CLI | `core/src/database/migration-guard.ts` + `migration-cli.ts` |
| SQL para marcar migraciones existentes | `core/database/baseline-mark-existing-migrations.sql` |

### `synchronize`

| `NODE_ENV` | `DB_SYNCHRONIZE` sin definir | `DB_SYNCHRONIZE=true` | `DB_SYNCHRONIZE=false` |
| --- | --- | --- | --- |
| `test` | **true** (las pruebas de integración crean el esquema) | true | false |
| `development` | **false** (cambio: antes era true) | true | false |
| `production` u otro | false | **error al arrancar** | false |

Si en tu entorno local dependías de que `development` sincronizara solo,
agrega `DB_SYNCHRONIZE=true` a tu `.env` **local** (solo contra una BD `_dev`).

### Scripts (desde `core/`)

| Script | Qué hace |
| --- | --- |
| `npm run migration:show` | Lista migraciones `[X]` ejecutadas / `[ ]` pendientes (solo lectura). |
| `npm run migration:run` | Ejecuta pendientes (una transacción por migración). |
| `npm run migration:revert` | Revierte la última ejecutada. |
| `npm run migration:generate -- src/database/migrations/<Nombre>` | Genera el diff entidades ↔ esquema de la BD apuntada. |
| `npm run migration:create -- src/database/migrations/<Nombre>` | Crea una migración vacía (no conecta). |
| `npm run migration:{show,run,revert}:prod` | Igual, pero con el build (`node dist/database/migration-cli.js`), sin ts-node. |

Todos (salvo `create`) imprimen `comando`, `NODE_ENV`, `host`, `puerto` y
`base` antes de conectar. Con `NODE_ENV=production` o host no local,
`run`, `revert` y `generate` abortan salvo `CONFIRM_MIGRATION=yes`.

## Paso a paso

Variables de ejemplo (ajústalas; **no** las pegues con contraseñas en el
historial — usa `read -rs` como abajo):

```bash
PROD_HOST=<host-mysql-prod>   PROD_PORT=<puerto>   PROD_USER=<usuario>   PROD_DB=<base-prod>
LOCAL_DB=real_estate_platform_baseline_dev
```

### 1. Respaldo completo de producción (datos + esquema)

```bash
mysqldump -h "$PROD_HOST" -P "$PROD_PORT" -u "$PROD_USER" -p \
  --single-transaction --routines --triggers --set-gtid-purged=OFF \
  "$PROD_DB" | gzip > backup_prod_$(date +%Y%m%d_%H%M).sql.gz
```

Guárdalo fuera del servidor de la app. Sin respaldo verificado, no sigas.

### 2. Exportar solo el esquema (sin datos)

```bash
mysqldump -h "$PROD_HOST" -P "$PROD_PORT" -u "$PROD_USER" -p \
  --no-data --single-transaction --routines --triggers --set-gtid-purged=OFF \
  "$PROD_DB" > schema_prod.sql

# Si ya existe una tabla `migrations` en producción, exporta también sus filas:
mysqldump -h "$PROD_HOST" -P "$PROD_PORT" -u "$PROD_USER" -p \
  --single-transaction --set-gtid-purged=OFF "$PROD_DB" migrations > migrations_prod.sql || true
```

### 3. Restaurar en una BD local `_dev`

```bash
mysql -h 127.0.0.1 -u root -p -e \
  "CREATE DATABASE $LOCAL_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -h 127.0.0.1 -u root -p "$LOCAL_DB" < schema_prod.sql
[ -s migrations_prod.sql ] && mysql -h 127.0.0.1 -u root -p "$LOCAL_DB" < migrations_prod.sql
```

### 4. Apuntar la CLI a la copia local y ver el estado

Las variables exportadas tienen prioridad sobre `core/.env`:

```bash
cd core
export NODE_ENV=development DB_HOST=127.0.0.1 DB_PORT=3306 DB_USERNAME=root DB_DATABASE=$LOCAL_DB
read -rs DB_PASSWORD && export DB_PASSWORD   # pide la contraseña sin mostrarla
npm run migration:show                       # debe decir host=127.0.0.1 base=..._dev
```

Lo normal es ver todas `[ ]` (pendientes) porque el esquema vino de `synchronize`.

### 5. Generar y revisar el diff entidades ↔ esquema real

```bash
npm run migration:generate -- src/database/migrations/BaselineDrift
```

- Si TypeORM dice que no hay cambios: el esquema coincide con las entidades.
- Es **esperable** que el diff incluya los índices `IDX_properties_*`
  (los agrega `1792180000000-AddPublicPropertyIndexes`). También puede mostrar
  `payments.currency`, `contracts.startDate` y `contracts.durationMonths`, que
  agrega `1792190000000-ContractPaymentsCurrencyAndRentDates`. Conserva esos
  cambios en las migraciones correspondientes; no los dupliques en `BaselineDrift`.
- Revisa aparte el backfill de pagos de `1792190000000` sobre la copia: contrasta
  `contracts.payments` con las filas de `payments`, en especial contratos que ya
  tienen pagos y pagos con estado `PENDING_VERIFICATION`. La comparación de
  esquema por sí sola no valida esa migración de datos.
- Revisa cada sentencia del archivo generado. En particular:
  - `DROP COLUMN`/`DROP TABLE`/`DROP INDEX`: ¿de verdad sobra? (p. ej.
    `contracts.changeHistory` no está en la entidad: si existe en prod,
    `synchronize` o el diff intentarán borrarlo).
  - Cambios de `ENUM` (región/comuna, estados): valores que ya están en uso.
  - Cambios de tipo/longitud o `NOT NULL` sobre tablas con datos.
- Quita del archivo lo que ya cubren `AddPublicPropertyIndexes` y
  `ContractPaymentsCurrencyAndRentDates`; deja solo la deriva real. Si queda
  vacío, **borra** el archivo generado.
- Recomendado: prueba la migración resultante en la copia `_dev`
  (`npm run migration:run` tras el paso 6, luego `npm run migration:revert`).

> No hay script de comparación "sin conexión": comparar entidades con el
> esquema requiere leer el esquema real, y eso es exactamente lo que hace
> `migration:generate` contra la copia local `_dev`. Por seguridad no se
> agregó un comparador que se conecte por su cuenta.

### 6. Marcar como ejecutadas las migraciones existentes (en la copia `_dev`)

```bash
mysql -h 127.0.0.1 -u root -p "$LOCAL_DB" < database/baseline-mark-existing-migrations.sql
npm run migration:show
```

Deben quedar `[X]` todas las migraciones históricas hasta `1792170000000`.
Deben quedar pendientes `AddPublicPropertyIndexes1792180000000` y
`ContractPaymentsCurrencyAndRentDates1792190000000` (y `BaselineDrift…` si la
creaste). Ejecuta las pendientes en local después de revisar la estructura y los
datos de pagos:

```bash
npm run migration:run
npm run migration:show   # todo [X]
```

Si algo falla en local, corrígelo antes de pasar a producción.

### 7. Aplicar en producción (ventana de mantenimiento)

1. Repite el paso 1 (respaldo fresco).
2. Despliega el código nuevo **sin** reiniciar todavía y compila: `npm ci && npm run build`.
3. Marca la línea base en producción (es solo un `INSERT`; idempotente):
   ```bash
   mysql -h "$PROD_HOST" -P "$PROD_PORT" -u "$PROD_USER" -p "$PROD_DB" \
     < database/baseline-mark-existing-migrations.sql
   ```
4. Revisa y ejecuta las pendientes con el build:
   ```bash
   NODE_ENV=production npm run migration:show:prod
   CONFIRM_MIGRATION=yes NODE_ENV=production npm run migration:run:prod
   NODE_ENV=production npm run migration:show:prod   # todo [X]
   ```
   (con las credenciales de producción en `core/.env` del servidor, como hoy;
   el script imprime host y base antes de conectar: verifica que sean los correctos).
5. Reinicia la app (`pm2 restart …`). Confirma que en el `.env` del servidor
   **no** existe `DB_SYNCHRONIZE=true` (si existiera, la app no arrancará).

Reversión: `CONFIRM_MIGRATION=yes NODE_ENV=production npm run migration:revert:prod`
revierte una migración por vez; ante un problema grave, restaura el respaldo del paso 1.

## Desde ahora

1. Cambias una entidad → `npm run migration:generate -- src/database/migrations/<Nombre>`
   contra tu BD local `_dev` (con `DB_SYNCHRONIZE` sin definir o `false`).
2. Revisas el SQL (MySQL, idempotente cuando sea razonable, `down()` real).
3. Commit de entidad + migración juntos.
4. En el servidor: `npm run build` y `CONFIRM_MIGRATION=yes NODE_ENV=production npm run migration:run:prod`.

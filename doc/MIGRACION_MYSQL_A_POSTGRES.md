# Migración MySQL → PostgreSQL

> **Estado:** Propuesta de diseño / plan operativo  
> **Fecha:** Julio 2026  
> **Complementa:**  
> - [`PLAN_PASO_A_PASO_SPLIT.md`](./PLAN_PASO_A_PASO_SPLIT.md) — split de apps (estabilizar antes o en paralelo controlado)  
> - [`MIGRACION_ARQUITECTURA_KAI.md`](./MIGRACION_ARQUITECTURA_KAI.md) — alineación con KAI (Postgres)  

Este documento define **por qué** migrar a PostgreSQL, **qué** hay que cambiar en `core/`, y **cómo** hacerlo por fases sin romper portal/backoffice.

---

## Tabla de contenidos

1. [Decisión y motivación](#1-decisión-y-motivación)
2. [Estado actual (MySQL)](#2-estado-actual-mysql)
3. [Arquitectura objetivo (Postgres)](#3-arquitectura-objetivo-postgres)
4. [Riesgos y puntos de fricción](#4-riesgos-y-puntos-de-fricción)
5. [Plan por fases](#5-plan-por-fases)
6. [Checklist de tipos y SQL](#6-checklist-de-tipos-y-sql)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Criterios de aceptación](#8-criterios-de-aceptación)
9. [Orden de trabajo sugerido](#9-orden-de-trabajo-sugerido)
10. [Referencias](#10-referencias)

---

## 1. Decisión y motivación

### Veredicto

**A largo plazo, PostgreSQL es la base de datos recomendada** para esta plataforma (NestJS + TypeORM, portal + backoffice, contratos, CMS, analítica, posible geo).

MySQL sigue siendo válido a corto plazo mientras se estabiliza el split. La migración a Postgres se planifica como proyecto explícito, no como cambio improvisado.

### Por qué Postgres

| Motivo | Detalle |
|--------|---------|
| Alineación con KAI | KAI usa PostgreSQL; mismos patrones de ops y TypeORM |
| Tipos de dominio | Enums nativos, UUID, JSONB, constraints más estrictos |
| Geo futuro | PostGIS (mapas, zonas, radio de búsqueda) |
| Consultas / reportes | Mejor soporte para analítica y queries complejas |
| Ecosistema cloud | Neon, Supabase, RDS, Render Postgres, etc. |

### Qué no implica esta decisión

- No obliga a migrar **hoy** en producción.
- No cambia contratos HTTP de portal/backoffice (solo capa de persistencia en `core/`).
- No requiere cambiar `portal/` ni `backoffice/` salvo URLs/env de API (sin cambios de BD en frontend).

---

## 2. Estado actual (MySQL)

| Aspecto | Valor |
|---------|--------|
| Motor | MySQL |
| Driver | `mysql2` |
| ORM | TypeORM 0.3 + `@nestjs/typeorm` |
| Config principal | [`core/src/config/ormconfig.ts`](../core/src/config/ormconfig.ts) (`type: 'mysql'`) |
| Configs adicionales | `database.config.ts`, `database.mysql2.config.ts` |
| Puerto típico | `3306` |
| BD ejemplo | `real_estate_platform` |
| Dev schema | `synchronize: true` en `development` / `test` |
| Migraciones | `core/src/database/migrations/` (SQL mixto; varias con dialecto MySQL) |
| Seeds | `core` scripts `db:seed` / `seed:reset` |

### Señales de acoplamiento a MySQL (inventario)

Revisar y adaptar en la migración:

- `MODIFY COLUMN`, `` `backticks` ``, `TINYINT(1)` en migraciones
- `type: 'enum'` en entidades TypeORM (Postgres usa tipos enum propios)
- Columnas `json` (en Postgres preferir `jsonb`)
- Columnas `uuid` (nativas en Postgres; en MySQL suelen ser `varchar`/`char`)
- Paths de globs en `ormconfig` que aún mencionan `backend/` (actualizar a `core/` al tocar config)

---

## 3. Arquitectura objetivo (Postgres)

```mermaid
flowchart LR
  Portal[portal :8001] --> Core[core NestJS :8000]
  Backoffice[backoffice :8002] --> Core
  Core --> PG[(PostgreSQL :5432)]
```

| Componente | Objetivo |
|------------|----------|
| Driver npm | `pg` (+ `@types/pg` en dev) |
| TypeORM `type` | `'postgres'` |
| Puerto | `5432` |
| Extensiones (fase posterior) | `uuid-ossp` o `pgcrypto`; PostGIS solo si hay geo |
| Migraciones | Nuevas migraciones **Postgres-first**; archivar o reescribir las MySQL |
| `synchronize` | Ideal: `false` en todos los entornos y usar migraciones formales |

Frontend (`portal`, `backoffice`) **no** habla con la BD: solo con `core`.

---

## 4. Riesgos y puntos de fricción

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Migraciones MySQL no portables | Alto | Regenerar baseline Postgres; no reusar SQL `MODIFY` |
| Enums TypeORM distintos por dialecto | Medio | Probar create/update de entidades con enum; ajustar columnas |
| Datos de producción | Alto | `pgloader` o export/import controlado; ventana de mantenimiento |
| Seeds rotos | Medio | Correr `seed:reset` en Postgres vacío como gate |
| Tests e2e/integration | Medio | Suite `npm run test:*` contra Postgres en CI |
| `synchronize: true` envejecido | Medio | Tras estabilizar, apagar sync y confiar en migraciones |
| Dual config (`ormconfig` + `database*.config`) | Bajo | Unificar en un solo factory Postgres |

---

## 5. Plan por fases

### Fase 0 — Precondiciones (recomendado)

- Split `core` / `portal` / `backoffice` estable en local (`npm run dev`).
- Backup de MySQL local/prod documentado.
- Decidir hosting Postgres (local Docker vs managed).

**Salida:** checklist de entorno y backup listo.

---

### Fase 1 — Spike local (BD vacía)

**Objetivo:** demostrar que el schema TypeORM arranca en Postgres sin datos.

1. Levantar Postgres (Docker ejemplo):

```bash
docker run --name re-postgres -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=real_estate_platform -p 5432:5432 -d postgres:16
```

2. En `core/`:
   - Añadir dependencia `pg`
   - Cambiar TypeORM a `type: 'postgres'`, `port: 5432`
   - Actualizar `DB_*` en `.env` / `envs/core.env.example`
3. Arrancar `core` con `synchronize: true` (solo spike) y verificar tablas.
4. Correr seeds: `npm run seed:reset --prefix core`
5. Correr subset de tests: auth, users, property, contract

**Salida:** spike OK documentado (qué falló / qué se ajustó en entidades).

**No** tocar producción en esta fase.

---

### Fase 2 — Ajuste de entidades y queries

1. Revisar entidades con `enum`, `json`, `uuid`, `boolean`.
2. Preferir `jsonb` donde hoy hay `json` (si TypeORM/columnas lo permiten).
3. Buscar SQL crudo (`.query(\``) y QueryBuilders con funciones MySQL (`IFNULL`, `GROUP_CONCAT`, etc.) y reemplazar por equivalentes Postgres o API TypeORM.
4. Unificar configs: un solo `ormConfig` Postgres; deprecar `database.mysql2.config.ts`.

**Salida:** app + tests verdes en Postgres vacío.

---

### Fase 3 — Migraciones formales Postgres

1. Con schema estable, generar **baseline** migration Postgres (schema inicial).
2. Archivar migraciones MySQL en `core/src/database/migrations/mysql-legacy/` o `legacy/docs` (referencia, no ejecutar).
3. Configurar `migrationsRun` / CLI TypeORM según convención del repo.
4. Poner `synchronize: false` en development (o solo en CI/staging primero).

**Salida:** entorno nuevo se levanta solo con migraciones Postgres.

---

### Fase 4 — Migración de datos (staging → prod)

Opciones (elegir una y documentar en el PR):

| Método | Cuándo |
|--------|--------|
| **A. Schema vacío + seeds** | Solo demos / sin datos críticos |
| **B. `pgloader` MySQL → Postgres** | Hay datos reales a conservar |
| **C. Export CSV/JSON + scripts** | Control fino por tabla |

Pasos genéricos (B):

1. Dump MySQL + snapshot.
2. Crear DB Postgres vacía.
3. Aplicar migraciones baseline.
4. Cargar datos con `pgloader` (o ETL).
5. Validar conteos por tabla, FKs, spot-checks (login staff/community, propiedad, contrato).
6. Cutover: apuntar `core` a Postgres; rollback = volver `DB_*` a MySQL + dump.

**Salida:** staging validado; runbook de prod escrito.

---

### Fase 5 — Hardening

1. Quitar `mysql2` si ya no se usa.
2. Actualizar `envs/`, Docker Compose, CI, docs (`QUICK_START` legacy, AGENTS).
3. (Opcional) Extensión PostGIS cuando exista requisito geo.
4. Monitoreo: conexiones, slow queries, backups automáticos.

---

## 6. Checklist de tipos y SQL

| MySQL | PostgreSQL | Acción |
|-------|------------|--------|
| `TINYINT(1)` | `boolean` | Mapear boolean TypeORM |
| `MODIFY COLUMN` | `ALTER COLUMN ... TYPE` | Reescribir migraciones |
| `` `table` `` | `"table"` o sin quotes | Evitar backticks |
| `JSON` | `JSONB` (preferido) | Revisar entidades |
| `ENUM('A','B')` | tipo `CREATE TYPE` / enum TypeORM | Probar inserts |
| `AUTO_INCREMENT` | `SERIAL` / `GENERATED` / UUID | Según PK actual (UUID preferred) |
| `IFNULL(a,b)` | `COALESCE(a,b)` | SQL crudo |
| `GROUP_CONCAT` | `string_agg` | SQL crudo |
| `NOW()` | `NOW()` / `CURRENT_TIMESTAMP` | Compatible en la práctica |

---

## 7. Variables de entorno

### Actual (MySQL)

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=real_estate_platform
```

### Objetivo (Postgres)

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=real_estate_platform
# Opcional URL única:
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/real_estate_platform
```

Actualizar:

- `envs/core.env.example`
- `core/.env` / `.env.example`
- Documentación de `npm run env:dev` si aplica
- Secrets de staging/prod

Portal y backoffice **no** necesitan `DB_*` (solo `AUTH_API_URL` → core).

---

## 8. Criterios de aceptación

### Spike (Fase 1–2)

- [ ] `core` arranca contra Postgres en `:8000`
- [ ] Seeds completan sin error
- [ ] Login staff (`/auth/staff/sign-in`) y community (`/auth/community/sign-in`) OK
- [ ] CRUD representativo: propiedad, contrato, notificación, CMS identity
- [ ] Tests de integración críticos verdes

### Datos (Fase 4)

- [ ] Conteos de tablas clave coinciden (tolerancia documentada)
- [ ] Spot-check de UUIDs y FKs (agent ↔ property, user ↔ favorites)
- [ ] Runbook de rollback probado en staging

### Cierre (Fase 5)

- [ ] No queda `type: 'mysql'` activo en configs de runtime
- [ ] Migraciones MySQL fuera del path de ejecución
- [ ] Docs y envs actualizados

---

## 9. Orden de trabajo sugerido

1. Docker Postgres local + env
2. Spike TypeORM `postgres` + synchronize
3. Seeds + tests
4. Ajustes enum/json/uuid/SQL
5. Baseline migration Postgres
6. Staging + datos
7. Cutover prod + quitar mysql2

**No hacer cutover de prod** hasta que el split de apps esté estable y el spike + staging estén verdes.

---

## 10. Referencias

| Recurso | Ubicación |
|---------|-----------|
| Config TypeORM actual | `core/src/config/ormconfig.ts` |
| Migraciones actuales | `core/src/database/migrations/` |
| Seeds | `core` → `npm run seed` / `seed:reset` |
| Env ejemplo | `envs/core.env.example` |
| KAI (Postgres) | `/Users/felipe/dev/kai` (backend TypeORM + PostgreSQL) |
| TypeORM Postgres | https://typeorm.io/data-source-options |
| pgloader | https://pgloader.readthedocs.io/ |

### Relación con otros docs

| Doc | Rol |
|-----|-----|
| [`PLAN_PASO_A_PASO_SPLIT.md`](./PLAN_PASO_A_PASO_SPLIT.md) | Apps y monorepo; estabilizar antes del cutover BD |
| [`MIGRACION_ARQUITECTURA_KAI.md`](./MIGRACION_ARQUITECTURA_KAI.md) | Visión ecosistema / mail |
| **Este documento** | Migración de persistencia MySQL → PostgreSQL |

---

## Resumen ejecutivo

- **Destino a largo plazo:** PostgreSQL.  
- **Ahora:** MySQL en `core` vía TypeORM/`mysql2`.  
- **Camino:** spike local → ajustes → migraciones Postgres → datos staging → cutover.  
- **Frontend:** sin cambios de BD; solo `core` y envs de base de datos.

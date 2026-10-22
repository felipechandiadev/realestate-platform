import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { buildMysqlBaseOptions } from './database-options';
import { resolveEnvFilePath } from './env-file';
import { entities } from './entities';

/**
 * DataSource ÚNICO para la CLI de migraciones (TypeORM 0.3).
 *
 * - Lee las mismas variables que la app (DB_HOST, DB_PORT, DB_USERNAME,
 *   DB_PASSWORD, DB_DATABASE) desde el mismo archivo que ConfigModule
 *   (`.env`, o `.env.test` si NODE_ENV=test). Las variables ya presentes en
 *   el entorno tienen prioridad (dotenv no las sobrescribe).
 * - synchronize y migrationsRun SIEMPRE en false: el esquema solo cambia con
 *   migraciones explícitas.
 * - Migraciones: src/database/migrations/*.ts con ts-node, o
 *   dist/database/migrations/*.js con el build de producción.
 *
 * Uso: ver scripts migration:* en core/package.json y core/database/BASELINE.md.
 */
const CORE_ROOT = join(__dirname, '..', '..');
loadEnv({ path: join(CORE_ROOT, resolveEnvFilePath(CORE_ROOT)) });

const MIGRATIONS_EXT = __filename.endsWith('.ts') ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  ...buildMysqlBaseOptions(),
  entities,
  migrations: [join(__dirname, '..', 'database', 'migrations', `*.${MIGRATIONS_EXT}`)],
  migrationsTableName: 'migrations',
  // MySQL hace commit implícito en DDL: una transacción por migración deja
  // el registro en `migrations` coherente con lo que realmente se aplicó.
  migrationsTransactionMode: 'each',
  synchronize: false,
  migrationsRun: false,
  dropSchema: false,
  logging: ['error', 'warn', 'migration'],
});

export default AppDataSource;

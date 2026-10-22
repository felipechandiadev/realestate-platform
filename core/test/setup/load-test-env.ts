/**
 * setupFiles de Jest para el proyecto "integration" (specs bajo core/test).
 *
 * - Fuerza NODE_ENV=test.
 * - Carga core/.env.test (con override) y falla de forma explícita si no existe;
 *   nunca cae en core/.env.
 * - Aplica la misma guardia que los seeders: los tests de integración usan
 *   dropSchema/synchronize, así que la BD debe ser local y terminar en
 *   _dev/_test/_local (o usar los overrides SEED_ALLOW_*).
 */
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';
import { assertSafeToSeed } from '../../database/seeders/seed-guard';

const envTestPath = join(__dirname, '..', '..', '.env.test');

if (!existsSync(envTestPath)) {
  throw new Error(
    `Falta core/.env.test. Los tests de integración NO usan core/.env como respaldo.\n` +
      `Copia core/.env.test.example a core/.env.test y configúralo con una BD de pruebas local.`,
  );
}

dotenv.config({ path: envTestPath, override: true });
process.env.NODE_ENV = 'test';
process.env.STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || 'local';

assertSafeToSeed(
  { host: process.env.DB_HOST, database: process.env.DB_DATABASE },
  'tests de integración',
);

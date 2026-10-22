import * as dotenv from 'dotenv';
import { join } from 'path';
import { resolveEnvFilePath } from '../src/config/env-file';
import { assertSafeToSeed } from '../database/seeders/seed-guard';

/**
 * Carga el mismo archivo de entorno que usará AppModule y aplica la guardia
 * de scripts destructivos ANTES de crear el contexto Nest (y por tanto antes
 * de conectar a la BD). Sin overrides explícitos (SEED_ALLOW_REMOTE /
 * SEED_ALLOW_ANY_DB) solo corre contra una BD local *_dev/_test/_local y
 * nunca con NODE_ENV=production.
 */
export function assertScriptTargetIsSafe(scriptName: string): void {
  const cwd = process.cwd();
  dotenv.config({ path: join(cwd, resolveEnvFilePath(cwd)) });
  assertSafeToSeed(
    {
      host: process.env.DB_HOST || '127.0.0.1',
      database: process.env.DB_DATABASE || 'real_estate_platform',
    },
    scriptName,
  );
}

import { existsSync } from 'fs';
import { join } from 'path';

export const TEST_ENV_FILE = '.env.test';
export const DEFAULT_ENV_FILE = '.env';

/**
 * Devuelve el archivo de entorno que debe cargar ConfigModule.
 * - NODE_ENV=test → `.env.test` (obligatorio; si falta se aborta en vez de
 *   caer silenciosamente en `.env`, que puede apuntar a una BD real).
 * - En cualquier otro caso → `.env`.
 */
export function resolveEnvFilePath(cwd: string = process.cwd()): string {
  if ((process.env.NODE_ENV || '').toLowerCase() === 'test') {
    if (!existsSync(join(cwd, TEST_ENV_FILE))) {
      throw new Error(
        `NODE_ENV=test pero no existe ${join(cwd, TEST_ENV_FILE)}. ` +
          `Copia core/.env.test.example a core/.env.test y apúntalo a una BD de pruebas ` +
          `(nunca se usa .env como respaldo en tests).`,
      );
    }
    return TEST_ENV_FILE;
  }
  return DEFAULT_ENV_FILE;
}

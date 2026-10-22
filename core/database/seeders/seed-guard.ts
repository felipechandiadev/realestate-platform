/**
 * Guardia de seguridad para scripts destructivos (seed, seed:reset, seed:minimal,
 * limpiezas). Aborta ANTES de conectar a la base de datos o tocar el bucket de
 * medios si el entorno no parece ser de desarrollo/pruebas.
 *
 * Condiciones (todas deben cumplirse):
 *  1. NODE_ENV !== 'production'
 *  2. El host de la BD es local (localhost, 127.0.0.1, ::1, mysql, db)
 *     o bien SEED_ALLOW_REMOTE=yes-i-know
 *  3. El nombre de la BD termina en _dev, _test o _local
 *     o bien SEED_ALLOW_ANY_DB=yes-i-know
 *
 * Nunca imprime credenciales; solo informa qué condición falló.
 */

import { LOCAL_DB_HOSTS } from '../../src/config/database-options';

export const SEED_LOCAL_HOSTS = LOCAL_DB_HOSTS;
export const SEED_SAFE_DB_SUFFIXES = ['_dev', '_test', '_local'];
const OVERRIDE_VALUE = 'yes-i-know';

export interface SeedGuardTarget {
  host?: string;
  database?: string;
}

export function getSeedGuardViolations(
  target: SeedGuardTarget,
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const violations: string[] = [];
  const nodeEnv = (env.NODE_ENV || '').trim().toLowerCase();
  const host = (target.host || '').trim().toLowerCase();
  const database = (target.database || '').trim().toLowerCase();

  if (nodeEnv === 'production') {
    violations.push('NODE_ENV es "production". Los scripts destructivos nunca se ejecutan en producción.');
  }

  if (!SEED_LOCAL_HOSTS.includes(host) && env.SEED_ALLOW_REMOTE !== OVERRIDE_VALUE) {
    violations.push(
      `El host de la base de datos no es local (permitidos: ${SEED_LOCAL_HOSTS.join(', ')}). ` +
        `Si de verdad quieres apuntar a un host remoto, define SEED_ALLOW_REMOTE=${OVERRIDE_VALUE}.`,
    );
  }

  if (
    !SEED_SAFE_DB_SUFFIXES.some((suffix) => database.endsWith(suffix)) &&
    env.SEED_ALLOW_ANY_DB !== OVERRIDE_VALUE
  ) {
    violations.push(
      `El nombre de la base de datos no termina en ${SEED_SAFE_DB_SUFFIXES.join(', ')}. ` +
        `Si de verdad quieres usar esta base, define SEED_ALLOW_ANY_DB=${OVERRIDE_VALUE}.`,
    );
  }

  return violations;
}

export function assertSafeToSeed(target: SeedGuardTarget, scriptName = 'seed'): void {
  const violations = getSeedGuardViolations(target);
  if (violations.length > 0) {
    const message = [
      `⛔ ABORTADO: "${scriptName}" borra o modifica datos y el entorno no parece seguro.`,
      ...violations.map((v) => `   - ${v}`),
      '   No se ha conectado a la base de datos ni se ha borrado nada.',
    ].join('\n');
    throw new Error(message);
  }
}

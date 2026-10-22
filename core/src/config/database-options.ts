import * as mysql from 'mysql2';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

/**
 * Opciones de conexión MySQL compartidas por la app (ormconfig.ts) y por la
 * CLI de migraciones (data-source.ts), para que ambas lean exactamente las
 * mismas variables de entorno: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD,
 * DB_DATABASE, NODE_ENV y DB_SYNCHRONIZE.
 */

/** Hosts considerados locales (también los usa la guardia de seeds). */
export const LOCAL_DB_HOSTS = ['localhost', '127.0.0.1', '::1', 'mysql', 'db'];

/** Entornos en los que se permite `DB_SYNCHRONIZE=true`. */
export const SYNCHRONIZE_ALLOWED_ENVS = ['development', 'test'];

export type EnvGetter = (key: string) => string | undefined;

export const processEnvGetter: EnvGetter = (key) => process.env[key];

export function isLocalDbHost(host?: string): boolean {
  return LOCAL_DB_HOSTS.includes((host || '').trim().toLowerCase());
}

/** Parsea un flag booleano de entorno. `undefined` si está vacío; error si es inválido. */
export function parseBooleanFlag(name: string, raw?: string): boolean | undefined {
  const value = (raw ?? '').trim().toLowerCase();
  if (value === '') return undefined;
  if (['true', '1', 'yes'].includes(value)) return true;
  if (['false', '0', 'no'].includes(value)) return false;
  throw new Error(`${name} tiene un valor inválido ("${raw}"). Usa true o false.`);
}

/**
 * Política de `synchronize` (fail-fast):
 * - test: activado por defecto (las pruebas de integración crean el esquema);
 *   se puede desactivar con DB_SYNCHRONIZE=false.
 * - development: desactivado salvo DB_SYNCHRONIZE=true explícito.
 * - production y cualquier otro entorno: siempre false; si DB_SYNCHRONIZE=true
 *   se lanza un error y la app no arranca.
 */
export function resolveSynchronize(get: EnvGetter = processEnvGetter): boolean {
  const nodeEnv = (get('NODE_ENV') || '').trim().toLowerCase();
  const flag = parseBooleanFlag('DB_SYNCHRONIZE', get('DB_SYNCHRONIZE'));

  if (flag === true && !SYNCHRONIZE_ALLOWED_ENVS.includes(nodeEnv)) {
    throw new Error(
      `DB_SYNCHRONIZE=true no está permitido con NODE_ENV="${nodeEnv || '(vacío)'}". ` +
        `Solo se admite en ${SYNCHRONIZE_ALLOWED_ENVS.join('/')}. ` +
        'En producción el esquema se cambia únicamente con migraciones (npm run migration:run).',
    );
  }
  if (nodeEnv === 'test') return flag !== false;
  if (nodeEnv === 'development') return flag === true;
  return false;
}

export interface DbTarget {
  host: string;
  port: number;
  database: string;
}

export function resolveDbTarget(get: EnvGetter = processEnvGetter): DbTarget {
  const rawHost = (get('DB_HOST') || '').trim();
  return {
    // mysql2 + "localhost" puede resolver a ::1; se fuerza IPv4 como antes.
    host: rawHost === 'localhost' ? '127.0.0.1' : rawHost,
    port: Number(get('DB_PORT') || 3306),
    database: (get('DB_DATABASE') || '').trim(),
  };
}

/** Opciones base MySQL (sin entities/migrations/synchronize). */
export function buildMysqlBaseOptions(
  get: EnvGetter = processEnvGetter,
): Pick<
  MysqlConnectionOptions,
  'type' | 'connectorPackage' | 'host' | 'port' | 'username' | 'password' | 'database' | 'driver' | 'extra'
> {
  const target = resolveDbTarget(get);
  return {
    type: 'mysql',
    connectorPackage: 'mysql2',
    host: target.host,
    port: target.port,
    username: get('DB_USERNAME'),
    password: get('DB_PASSWORD'),
    database: target.database,
    driver: mysql,
    extra: {
      connectionLimit: 30,
      // Aiven/cloud MySQL closes idle sockets; keepalive + short idle recycle
      // reduces QueryFailedError: read ECONNRESET on first request after idle.
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 10_000,
      idleTimeout: 60_000,
      maxIdle: 10,
      decimalNumbers: true,
      supportBigNumbers: true,
    },
  };
}

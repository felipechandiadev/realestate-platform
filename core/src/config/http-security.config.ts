import type { HelmetOptions } from 'helmet';

/** Orígenes de producción usados si no se define CORS_ORIGINS. */
export const DEFAULT_PRODUCTION_ORIGINS = [
  'https://bravoshottpropiedades.cl',
  'https://www.bravoshottpropiedades.cl',
  'https://admin.bravoshottpropiedades.cl',
];

/** Orígenes locales: solo se agregan fuera de producción. */
export const LOCAL_DEV_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:8000',
  'http://localhost:8001',
  'http://localhost:8002',
];

export const JSON_BODY_LIMIT = '1mb';

export function isProduction(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.NODE_ENV === 'production';
}

function isLocalOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(origin);
}

/**
 * Lista de orígenes CORS.
 * - `CORS_ORIGINS` (separados por coma) reemplaza la lista por defecto.
 * - Por defecto: dominios de producción + PORTAL_URL / BACKOFFICE_URL.
 * - Orígenes localhost solo fuera de producción (en producción se descartan
 *   incluso si vienen en CORS_ORIGINS).
 */
export function resolveCorsOrigins(
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const production = isProduction(env);
  const fromEnv = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  const base =
    fromEnv.length > 0
      ? fromEnv
      : [
          ...DEFAULT_PRODUCTION_ORIGINS,
          ...[env.PORTAL_URL, env.BACKOFFICE_URL]
            .filter((value): value is string => Boolean(value))
            .map((value) => value.trim().replace(/\/+$/, '')),
        ];

  const origins = production
    ? base.filter((origin) => !isLocalOrigin(origin))
    : [...base, ...LOCAL_DEV_ORIGINS];

  return Array.from(new Set(origins));
}

/** Swagger (/api) solo fuera de producción. */
export function isSwaggerEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return !isProduction(env);
}

/**
 * Opciones de helmet.
 * - crossOriginResourcePolicy "cross-origin": el portal/backoffice (otro
 *   dominio) deben poder cargar imágenes de /public.
 * - CSP desactivada fuera de producción para no romper Swagger UI; en
 *   producción (sin Swagger) se usa la CSP por defecto de helmet, suficiente
 *   para una API JSON + archivos estáticos.
 */
export function buildHelmetOptions(
  env: NodeJS.ProcessEnv = process.env,
): HelmetOptions {
  return {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: isSwaggerEnabled(env) ? false : undefined,
  };
}

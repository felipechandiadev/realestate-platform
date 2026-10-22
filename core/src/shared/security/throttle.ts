import { Throttle } from '@nestjs/throttler';

/** Límite global por IP: ~100 peticiones por minuto. */
export const DEFAULT_THROTTLE_TTL_MS = 60_000;
export const DEFAULT_THROTTLE_LIMIT = 100;

/** Inicios de sesión y verificación de correo: 10 por minuto por IP. */
export const AUTH_THROTTLE_LIMIT = 10;

/** Registro, recuperación de contraseña, reenvíos y formularios públicos: 5 por minuto por IP. */
export const STRICT_THROTTLE_LIMIT = 5;

/** Para rutas de inicio de sesión / verificación. */
export const AuthThrottle = () =>
  Throttle({
    default: { limit: AUTH_THROTTLE_LIMIT, ttl: DEFAULT_THROTTLE_TTL_MS },
  });

/** Para rutas públicas sensibles a abuso (registro, recuperación, formularios). */
export const StrictThrottle = () =>
  Throttle({
    default: { limit: STRICT_THROTTLE_LIMIT, ttl: DEFAULT_THROTTLE_TTL_MS },
  });

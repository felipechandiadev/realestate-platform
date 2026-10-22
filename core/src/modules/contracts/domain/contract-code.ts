import { randomBytes } from 'crypto';

/**
 * Genera el código de un contrato (columna `contracts.code`, varchar 64).
 * Formato: C-<epoch ms>-<6 hex aleatorios>, p. ej. C-1761170000000-a1b2c3.
 * Reemplaza al antiguo monkey-patch global de Repository.save.
 */
export function generateContractCode(now: number = Date.now()): string {
  return `C-${now}-${randomBytes(3).toString('hex')}`;
}

/** Asigna un código si el objeto no tiene uno. Devuelve el mismo objeto. */
export function ensureContractCode<T extends { code?: string | null }>(
  target: T,
): T {
  if (target && !target.code) {
    target.code = generateContractCode();
  }
  return target;
}

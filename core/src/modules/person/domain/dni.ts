/**
 * RUT/DNI de una persona.
 *
 * Un RUT chileno se guarda siempre igual —sin puntos, con guion y "K" mayúscula
 * (12345678-9)— para que "12.345.678-9" y "123456789" no queden como personas
 * distintas. Otros documentos (pasaportes, DNI extranjeros) solo se recortan.
 */
const RUT_BODY = /^\d{1,8}[0-9K]$/;

export function normalizeDni(value?: string | null): string | undefined {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim().toUpperCase();
  if (!trimmed) return undefined;

  const compact = trimmed.replace(/[.\s-]/g, '');
  if (!RUT_BODY.test(compact)) return trimmed;
  return `${compact.slice(0, -1)}-${compact.slice(-1)}`;
}

/** Forma comparable: sin puntos, espacios ni guiones, en mayúsculas. */
export function compactDni(value: string): string {
  return value.trim().toUpperCase().replace(/[.\s-]/g, '');
}

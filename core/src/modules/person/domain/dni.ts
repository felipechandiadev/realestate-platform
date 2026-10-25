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
  return value
    .trim()
    .toUpperCase()
    .replace(/[.\s-]/g, '');
}

/**
 * ¿El RUT tiene un dígito verificador válido (módulo 11)? Solo aplica a RUT
 * chilenos; para otros documentos devuelve true.
 */
export function hasValidRutCheckDigit(value: string): boolean {
  const compact = compactDni(value);
  if (!RUT_BODY.test(compact)) return true;
  const body = compact.slice(0, -1);
  const given = compact.slice(-1);
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  const expected = rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
  return given === expected;
}

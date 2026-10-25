import { compactDni, normalizeDni } from './dni';

describe('normalizeDni', () => {
  it.each([
    ['12.345.678-9', '12345678-9'],
    ['123456789', '12345678-9'],
    [' 12345678-k ', '12345678-K'],
    ['9.876.543-2', '9876543-2'],
  ])('RUT %s → %s', (input, expected) => {
    expect(normalizeDni(input)).toBe(expected);
  });

  it('no altera documentos que no son RUT (pasaportes, DNI extranjeros)', () => {
    expect(normalizeDni('ab1234567')).toBe('AB1234567');
    expect(normalizeDni('X-12345678-Z')).toBe('X-12345678-Z');
  });

  it('vacío o ausente queda sin RUT', () => {
    expect(normalizeDni('   ')).toBeUndefined();
    expect(normalizeDni(null)).toBeUndefined();
    expect(normalizeDni(undefined)).toBeUndefined();
  });

  it('compactDni iguala formatos distintos del mismo RUT', () => {
    expect(compactDni('12.345.678-9')).toBe(compactDni('123456789'));
    expect(compactDni('12345678-k')).toBe('12345678K');
  });
});

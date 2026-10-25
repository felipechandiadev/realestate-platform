import { describe, it, expect } from '@jest/globals';
import { monthlyDueDates } from '../src/features/contracts/utils/rent-schedule';

describe('monthlyDueDates', () => {
  it('genera una fecha por mes desde el inicio', () => {
    expect(monthlyDueDates('2026-11-05', 3)).toEqual(['2026-11-05', '2026-12-05', '2027-01-05']);
  });

  it('usa el último día cuando el mes es más corto (no salta de mes)', () => {
    expect(monthlyDueDates('2026-01-31', 4)).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
      '2026-04-30',
    ]);
    expect(monthlyDueDates('2028-01-30', 2)).toEqual(['2028-01-30', '2028-02-29']);
  });

  it('no corre la fecha un día por zona horaria', () => {
    expect(monthlyDueDates('2026-03-01', 1)).toEqual(['2026-03-01']);
  });

  it('devuelve vacío con datos inválidos', () => {
    expect(monthlyDueDates('', 3)).toEqual([]);
    expect(monthlyDueDates('2026-01-01', 0)).toEqual([]);
    expect(monthlyDueDates('2026-01-01', 1.5)).toEqual([]);
  });
});

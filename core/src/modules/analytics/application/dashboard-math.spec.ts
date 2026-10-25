import { monthRange, percentChange, toMillions } from './dashboard-math';
import {
  CONTRACT_AMOUNT_CLP,
  CONTRACT_CLOSURE_DAYS,
  PAYMENT_AMOUNT_CLP,
} from './analytics-sql';

describe('dashboard-math', () => {
  it('percentChange compara contra el período anterior y no inventa variación sin base', () => {
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(80, 100)).toBe(-20);
    expect(percentChange(5, 0)).toBeNull();
  });

  it('monthRange acepta meses fuera de rango (enero − 1 = diciembre del año anterior)', () => {
    const { start, end } = monthRange(2026, -1);
    expect([start.getFullYear(), start.getMonth(), start.getDate()]).toEqual([
      2025, 11, 1,
    ]);
    expect([end.getFullYear(), end.getMonth(), end.getDate()]).toEqual([
      2025, 11, 31,
    ]);
  });

  it('toMillions deja un decimal', () => {
    expect(toMillions(918_000)).toBe(0.9);
    expect(toMillions(12_340_000)).toBe(12.3);
  });

  it('los montos en UF se convierten a CLP y el cierre usa endDate', () => {
    expect(PAYMENT_AMOUNT_CLP).toContain("p.currency = 'UF'");
    expect(PAYMENT_AMOUNT_CLP).toContain('c.ufValue');
    expect(CONTRACT_AMOUNT_CLP).toContain('contract.ufValue');
    expect(CONTRACT_CLOSURE_DAYS).toBe(
      'DATEDIFF(contract.endDate, contract.createdAt)',
    );
  });
});

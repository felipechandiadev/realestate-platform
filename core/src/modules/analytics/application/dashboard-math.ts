/** Primer y último instante de un mes (el mes puede venir fuera de rango: -1 = diciembre anterior). */
export function monthRange(
  year: number,
  monthIndex: number,
): { start: Date; end: Date } {
  return {
    start: new Date(year, monthIndex, 1),
    end: new Date(year, monthIndex + 1, 0, 23, 59, 59),
  };
}

/** Variación porcentual redondeada; null si el período anterior es 0 (no hay base para comparar). */
export function percentChange(
  current: number,
  previous: number,
): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Millones con un decimal (formato de los gráficos). */
export function toMillions(amount: number): number {
  return Math.round((amount / 1_000_000) * 10) / 10;
}

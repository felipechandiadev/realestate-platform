/**
 * Fechas de las cuotas mensuales de un arriendo, en formato YYYY-MM-DD.
 *
 * Trabaja con año/mes/día (sin zonas horarias, para no correr fechas un día) y,
 * si el mes no tiene ese día, usa el último: un arriendo que parte el 31 de enero
 * paga el 28/29 de febrero y el 31 de marzo, no el 3 de marzo.
 */
export function monthlyDueDates(startDate: string, months: number): string[] {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(startDate);
  if (!match || !Number.isInteger(months) || months < 1) return [];

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  return Array.from({ length: months }, (_, offset) => {
    const totalMonths = monthIndex + offset;
    const y = year + Math.floor(totalMonths / 12);
    const m = totalMonths % 12;
    const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const d = Math.min(day, lastDay);
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });
}

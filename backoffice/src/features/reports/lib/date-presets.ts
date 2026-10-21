export type ReportDatePreset =
  | 'thisWeek'
  | 'thisMonth'
  | 'last7Days'
  | 'last3Months'
  | 'last6Months'
  | 'last12Months'
  | 'custom'
  | 'allTime';

export type ReportDateRange = {
  startDate: string;
  endDate: string;
};

export const REPORT_DATE_PRESETS = [
  { id: 'thisWeek', label: 'Esta semana (lunes a hoy)' },
  { id: 'thisMonth', label: 'Este mes (inicio de mes a hoy)' },
  { id: 'last7Days', label: 'Últimos 7 días' },
  { id: 'last3Months', label: 'Últimos 3 meses' },
  { id: 'last6Months', label: 'Último semestre (6 meses)' },
  { id: 'last12Months', label: 'Últimos 12 meses' },
  { id: 'custom', label: 'Período personalizado' },
  { id: 'allTime', label: 'Todo el período disponible' },
] as const;

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function subtractMonths(date: Date, months: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), 1);
  result.setMonth(result.getMonth() - months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(date.getDate(), lastDay));
  return result;
}

export function getReportDateRange(
  preset: ReportDatePreset,
  now = new Date(),
): ReportDateRange | null {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === 'allTime' || preset === 'custom') return null;

  if (preset === 'thisWeek') {
    const start = new Date(end);
    const daysSinceMonday = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - daysSinceMonday);
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }

  if (preset === 'thisMonth') {
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }

  if (preset === 'last7Days') {
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
  }

  const months = preset === 'last3Months' ? 3 : preset === 'last6Months' ? 6 : 12;
  return {
    startDate: toIsoDate(subtractMonths(end, months)),
    endDate: toIsoDate(end),
  };
}

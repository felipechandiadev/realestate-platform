/** Deterministic date/time for SSR + client (avoids es-CL NBSP / TZ hydration mismatches). */
export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago',
    }).format(new Date(value));
  } catch {
    return typeof value === 'string' ? value : '—';
  }
}

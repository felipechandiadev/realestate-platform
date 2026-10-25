/** Textos para mostrar datos de usuarios en español (grillas y fichas). */

export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  VACATION: 'Vacaciones',
  LEAVE: 'Licencia',
};

export const USER_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  AGENT: 'Agente',
  COMMUNITY: 'Cliente',
};

export function userStatusLabel(status?: string | null): string {
  return (status && USER_STATUS_LABELS[status]) || status || '—';
}

export function userRoleLabel(role?: string | null): string {
  return (role && USER_ROLE_LABELS[role]) || role || '—';
}

/** Fecha legible en horario de Chile (dd-mm-aaaa hh:mm); "—" si falta o es inválida. */
export function formatUserDate(value?: string | Date | null): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
}

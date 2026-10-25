import { describe, it, expect } from '@jest/globals';
import { formatUserDate, userRoleLabel, userStatusLabel } from '../src/features/users/format';

describe('formato de usuarios', () => {
  it('traduce estados y roles; deja tal cual lo desconocido', () => {
    expect(userStatusLabel('ACTIVE')).toBe('Activo');
    expect(userStatusLabel('VACATION')).toBe('Vacaciones');
    expect(userStatusLabel('LEAVE')).toBe('Licencia');
    expect(userStatusLabel(undefined)).toBe('—');
    expect(userRoleLabel('ADMIN')).toBe('Administrador');
    expect(userRoleLabel('OTRO')).toBe('OTRO');
  });

  it('muestra fechas legibles en hora de Chile', () => {
    expect(formatUserDate('2026-10-24T20:33:20.311Z')).toMatch(/^24-10-2026,? 17:33$/);
    expect(formatUserDate(null)).toBe('—');
    expect(formatUserDate('no-es-fecha')).toBe('—');
  });
});

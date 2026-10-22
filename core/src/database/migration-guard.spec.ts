import {
  describeMigrationTarget,
  getMigrationGuardViolations,
  requiresMigrationConfirmation,
} from './migration-guard';

const local = { host: '127.0.0.1', port: 3306, database: 'real_estate_platform_dev' };
const remote = { host: 'mysql-x.aivencloud.com', port: 12345, database: 'defaultdb' };

describe('migration-guard', () => {
  it('local en development: run sin confirmación', () => {
    expect(getMigrationGuardViolations('run', local, { NODE_ENV: 'development' })).toEqual([]);
  });

  it('host remoto: run/revert/generate exigen CONFIRM_MIGRATION=yes', () => {
    for (const cmd of ['run', 'revert', 'generate'] as const) {
      expect(requiresMigrationConfirmation(cmd, remote, {})).toBe(true);
      expect(getMigrationGuardViolations(cmd, remote, {})).toHaveLength(1);
      expect(getMigrationGuardViolations(cmd, remote, { CONFIRM_MIGRATION: 'yes' })).toEqual([]);
    }
  });

  it('NODE_ENV=production exige confirmación aunque el host sea local', () => {
    expect(getMigrationGuardViolations('run', local, { NODE_ENV: 'production' })).toHaveLength(1);
    expect(getMigrationGuardViolations('run', local, { NODE_ENV: 'production', CONFIRM_MIGRATION: 'si' })).toHaveLength(1);
    expect(getMigrationGuardViolations('run', local, { NODE_ENV: 'production', CONFIRM_MIGRATION: 'yes' })).toEqual([]);
  });

  it('show no pide confirmación', () => {
    expect(getMigrationGuardViolations('show', remote, { NODE_ENV: 'production' })).toEqual([]);
  });

  it('host o base vacíos bloquean', () => {
    expect(getMigrationGuardViolations('show', { host: '', port: 3306, database: '' }, {})).toHaveLength(2);
  });

  it('la descripción no incluye credenciales', () => {
    const text = describeMigrationTarget('run', remote, { NODE_ENV: 'production', DB_PASSWORD: 'secreto', DB_USERNAME: 'admin' });
    expect(text).toContain('host=mysql-x.aivencloud.com');
    expect(text).toContain('base=defaultdb');
    expect(text).not.toContain('secreto');
    expect(text).not.toContain('admin');
  });
});

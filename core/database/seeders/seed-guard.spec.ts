import { assertSafeToSeed, getSeedGuardViolations } from './seed-guard';

describe('seed-guard', () => {
  const ok = { host: '127.0.0.1', database: 'realestate_dev' };

  it('permite host local y BD con sufijo seguro', () => {
    expect(getSeedGuardViolations(ok, { NODE_ENV: 'development' })).toEqual([]);
    expect(getSeedGuardViolations({ host: 'mysql', database: 'x_test' }, {})).toEqual([]);
    expect(() => assertSafeToSeed({ host: 'localhost', database: 'a_local' })).not.toThrow();
  });

  it('bloquea NODE_ENV=production aunque haya overrides', () => {
    const v = getSeedGuardViolations(ok, {
      NODE_ENV: 'production',
      SEED_ALLOW_REMOTE: 'yes-i-know',
      SEED_ALLOW_ANY_DB: 'yes-i-know',
    });
    expect(v).toHaveLength(1);
  });

  it('bloquea host remoto salvo SEED_ALLOW_REMOTE=yes-i-know', () => {
    const remote = { host: 'db.example.aivencloud.com', database: 'realestate_dev' };
    expect(getSeedGuardViolations(remote, {})).toHaveLength(1);
    expect(getSeedGuardViolations(remote, { SEED_ALLOW_REMOTE: 'yes' })).toHaveLength(1);
    expect(getSeedGuardViolations(remote, { SEED_ALLOW_REMOTE: 'yes-i-know' })).toEqual([]);
  });

  it('bloquea BD sin sufijo salvo SEED_ALLOW_ANY_DB=yes-i-know', () => {
    const prodName = { host: '127.0.0.1', database: 'real_estate_platform' };
    expect(getSeedGuardViolations(prodName, {})).toHaveLength(1);
    expect(getSeedGuardViolations(prodName, { SEED_ALLOW_ANY_DB: 'yes-i-know' })).toEqual([]);
  });

  it('el mensaje de error no incluye el host ni el nombre de la BD', () => {
    const target = { host: 'secret-host.example.com', database: 'secret_db' };
    const prev = { ...process.env };
    delete process.env.SEED_ALLOW_REMOTE;
    delete process.env.SEED_ALLOW_ANY_DB;
    try {
      assertSafeToSeed(target, 'seed');
      fail('debió lanzar');
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain('ABORTADO');
      expect(msg).not.toContain('secret-host');
      expect(msg).not.toContain('secret_db');
    } finally {
      process.env = prev;
    }
  });
});

import { mkdtempSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { resolveEnvFilePath } from './env-file';

describe('resolveEnvFilePath', () => {
  const prevNodeEnv = process.env.NODE_ENV;
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'envfile-'));
  });
  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv;
    rmSync(dir, { recursive: true, force: true });
  });

  it('usa .env fuera de test', () => {
    process.env.NODE_ENV = 'development';
    expect(resolveEnvFilePath(dir)).toBe('.env');
  });

  it('en test exige .env.test y no cae en .env', () => {
    process.env.NODE_ENV = 'test';
    writeFileSync(join(dir, '.env'), 'X=1');
    expect(() => resolveEnvFilePath(dir)).toThrow(/\.env\.test/);
  });

  it('en test usa .env.test si existe', () => {
    process.env.NODE_ENV = 'test';
    writeFileSync(join(dir, '.env.test'), 'X=1');
    expect(resolveEnvFilePath(dir)).toBe('.env.test');
  });
});

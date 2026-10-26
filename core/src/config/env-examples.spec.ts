import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

/** Variables declaradas (activas o comentadas) en un .env.example. */
function declaredKeys(content: string): Set<string> {
  const keys = new Set<string>();
  for (const line of content.split('\n')) {
    const m = line.match(/^#?\s*([A-Z][A-Z0-9_]+)=/);
    if (m) keys.add(m[1]);
  }
  return keys;
}

function activeValue(content: string, key: string): string | undefined {
  const m = content.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m?.[1];
}

describe('.env.example', () => {
  it.each(['core', 'portal', 'backoffice'])(
    '%s/.env.example coincide con envs/%s.env.example',
    (app) => {
      expect(read(`${app}/.env.example`)).toBe(read(`envs/${app}.env.example`));
    },
  );

  it('core documenta las variables obligatorias de auth, URLs, correo y R2', () => {
    const keys = declaredKeys(read('core/.env.example'));
    for (const key of [
      'JWE_PRIVATE_KEY',
      'JWE_PUBLIC_KEY',
      'BACKEND_PUBLIC_URL',
      'PORTAL_URL',
      'CORS_ORIGINS',
      'THROTTLE_SKIP_IPS',
      'MAIL_HOST',
      'MAIL_PORT',
      'MAIL_USER',
      'MAIL_PASS',
      'MAIL_FROM',
      'R2_ACCOUNT_ID',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_BUCKET_NAME',
      'R2_PUBLIC_URL',
    ]) {
      expect(keys).toContain(key);
    }
  });

  it('core no vacía el bucket por defecto', () => {
    const core = read('core/.env.example');
    expect(activeValue(core, 'SEED_WIPE_BUCKET')).toBe('false');
    expect(activeValue(core, 'SEED_WIPE_ALLOWED_BUCKETS')).toBe('');
  });

  it('core explica que Resend se usa por el puerto 587', () => {
    expect(read('core/.env.example')).toMatch(/MAIL_PORT=587/);
  });

  it.each(['portal', 'backoffice'])('%s declara su URL pública de R2 y de NextAuth', (app) => {
    const keys = declaredKeys(read(`${app}/.env.example`));
    for (const key of ['R2_PUBLIC_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET', 'BACKEND_API_URL', 'NEXT_PUBLIC_PORTAL_URL']) {
      expect(keys).toContain(key);
    }
  });

  it('ningún ejemplo trae claves reales', () => {
    for (const app of ['core', 'portal', 'backoffice']) {
      expect(read(`${app}/.env.example`)).not.toMatch(/re_[A-Za-z0-9]{20,}|-----BEGIN/);
    }
  });
});

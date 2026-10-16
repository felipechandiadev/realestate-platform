import type { INestApplication } from '@nestjs/common';
import request from 'supertest';

export const SEED_STAFF_ADMIN = {
  email: 'admin@realestate.com',
  password: '7890',
} as const;

export const SEED_STAFF_RE = {
  email: 'admin@re.cl',
  password: '890890',
} as const;

type LoginResult = {
  accessToken: string;
  user?: { id?: string; email?: string; role?: string };
};

async function loginVia(
  app: INestApplication,
  path: string,
  credentials: { email: string; password: string },
): Promise<LoginResult | null> {
  const response = await request(app.getHttpServer()).post(path).send(credentials);
  if (response.status >= 400) {
    return null;
  }
  const accessToken =
    response.body?.access_token || response.body?.accessToken || response.body?.token;
  if (typeof accessToken !== 'string' || !accessToken) {
    return null;
  }
  return { accessToken, user: response.body?.user };
}

/** Staff JWT from seed (tries staff sign-in, then legacy sign-in, then alternate admin). */
export async function loginStaff(app: INestApplication): Promise<LoginResult> {
  const attempts: Array<{ path: string; creds: { email: string; password: string } }> = [
    { path: '/auth/staff/sign-in', creds: SEED_STAFF_ADMIN },
    { path: '/auth/sign-in', creds: SEED_STAFF_ADMIN },
    { path: '/auth/staff/sign-in', creds: SEED_STAFF_RE },
    { path: '/auth/sign-in', creds: SEED_STAFF_RE },
  ];

  for (const attempt of attempts) {
    const result = await loginVia(app, attempt.path, attempt.creds);
    if (result) return result;
  }

  throw new Error(
    'loginStaff failed: no seed admin could sign in. Run npm run seed:reset in core.',
  );
}

export async function loginCommunity(
  app: INestApplication,
  credentials: { email: string; password: string },
): Promise<LoginResult> {
  const result =
    (await loginVia(app, '/auth/community/sign-in', credentials)) ||
    (await loginVia(app, '/auth/sign-in', credentials));
  if (!result) {
    throw new Error(`loginCommunity failed for ${credentials.email}`);
  }
  return result;
}

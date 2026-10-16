import * as crypto from 'crypto';
import { JweService } from '../../src/modules/auth/infrastructure/jwe/jwe.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  authAudience?: string;
  [key: string]: unknown;
}

let jweService: JweService | undefined;

export const setJweService = (service: JweService) => {
  jweService = service;
};

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

/** HS256 JWT without the jsonwebtoken package (matches JWT_SECRET used in tests). */
export function signHs256Jwt(payload: Record<string, unknown>, expiresInSec = 3600): string {
  const secret = process.env.JWT_SECRET || 'test-secret';
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const body = { ...payload, iat: now, exp: now + expiresInSec };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export const createJwtToken = async (payload: JwtPayload): Promise<string> => {
  if (jweService && process.env.NODE_ENV !== 'test') {
    return jweService.encrypt(payload, '1h');
  }
  return signHs256Jwt(payload as Record<string, unknown>);
};

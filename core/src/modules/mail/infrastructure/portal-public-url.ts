import { ConfigService } from '@nestjs/config';

/**
 * Public portal origin for links in emails (verify, reset password).
 * Prefers PORTAL_URL (current monorepo), then FRONTEND_PUBLIC_URL, then local default.
 */
export function resolvePortalPublicUrl(config: ConfigService): string {
  const fromEnv =
    config.get<string>('PORTAL_URL') ||
    config.get<string>('FRONTEND_PUBLIC_URL') ||
    'http://localhost:8001';
  return fromEnv.replace(/\/+$/, '');
}

export function buildPortalVerifyEmailUrl(
  config: ConfigService,
  token: string,
): string {
  return `${resolvePortalPublicUrl(config)}/verify-email?token=${encodeURIComponent(token)}`;
}

export function buildPortalResetPasswordUrl(
  config: ConfigService,
  token: string,
): string {
  return `${resolvePortalPublicUrl(config)}/reset-password?token=${encodeURIComponent(token)}`;
}

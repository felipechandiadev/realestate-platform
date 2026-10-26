/** Tests unitarios (sin BD ni servidor): metadatos de rate limiting y guard por IP. */
import { Reflector } from '@nestjs/core';
import {
  THROTTLER_LIMIT,
  THROTTLER_TTL,
} from '@nestjs/throttler/dist/throttler.constants';
import { AuthController } from '../../modules/auth/presentation/auth.controller';
import { PasswordRecoveryController } from '../../modules/password-recovery/presentation/password-recovery.controller';
import { ResendVerificationController } from '../../modules/users/presentation/resend-verification.controller';
import { NotificationsController } from '../../modules/notifications/presentation/notifications.controller';
import { PropertyController } from '../../modules/property/presentation/property.controller';
import {
  AUTH_THROTTLE_LIMIT,
  DEFAULT_THROTTLE_TTL_MS,
  STRICT_THROTTLE_LIMIT,
} from './throttle';
import {
  AppThrottlerGuard,
  DEFAULT_THROTTLE_SKIP_IPS,
  parseThrottleSkipIps,
} from './app-throttler.guard';

function limitOf(target: any, method: string): number | undefined {
  return Reflect.getMetadata(
    THROTTLER_LIMIT + 'default',
    target.prototype[method],
  );
}
function ttlOf(target: any, method: string): number | undefined {
  return Reflect.getMetadata(
    THROTTLER_TTL + 'default',
    target.prototype[method],
  );
}

describe('Rate limiting: metadatos en rutas sensibles', () => {
  it.each([
    [AuthController, 'signIn', AUTH_THROTTLE_LIMIT],
    [AuthController, 'staffSignIn', AUTH_THROTTLE_LIMIT],
    [AuthController, 'communitySignIn', AUTH_THROTTLE_LIMIT],
    [AuthController, 'verifyEmail', AUTH_THROTTLE_LIMIT],
    [AuthController, 'register', STRICT_THROTTLE_LIMIT],
    [AuthController, 'communityRegister', STRICT_THROTTLE_LIMIT],
    [AuthController, 'resendVerificationEmail', STRICT_THROTTLE_LIMIT],
    [PasswordRecoveryController, 'requestReset', STRICT_THROTTLE_LIMIT],
    [PasswordRecoveryController, 'validateToken', STRICT_THROTTLE_LIMIT],
    [PasswordRecoveryController, 'resetPassword', STRICT_THROTTLE_LIMIT],
    [ResendVerificationController, 'resendVerification', STRICT_THROTTLE_LIMIT],
    [
      NotificationsController,
      'notifyPublicPropertyInterest',
      STRICT_THROTTLE_LIMIT,
    ],
    [NotificationsController, 'notifyPublicContact', STRICT_THROTTLE_LIMIT],
    [PropertyController, 'publishPublic', STRICT_THROTTLE_LIMIT],
  ])(
    '%p.%s tiene límite %i/min',
    (ctrl: any, method: string, limit: number) => {
      expect(typeof ctrl.prototype[method]).toBe('function');
      expect(limitOf(ctrl, method)).toBe(limit);
      expect(ttlOf(ctrl, method)).toBe(DEFAULT_THROTTLE_TTL_MS);
    },
  );

  it('los límites estrictos están entre 5 y 10 por minuto', () => {
    for (const limit of [AUTH_THROTTLE_LIMIT, STRICT_THROTTLE_LIMIT]) {
      expect(limit).toBeGreaterThanOrEqual(5);
      expect(limit).toBeLessThanOrEqual(10);
    }
  });

  it('refresh no tiene límite estricto (usa el global)', () => {
    expect(limitOf(AuthController, 'refresh')).toBeUndefined();
  });
});

describe('AppThrottlerGuard', () => {
  const ctx = (ip: string, type = 'http') =>
    ({
      getType: () => type,
      switchToHttp: () => ({ getRequest: () => ({ ip }) }),
    }) as any;

  afterEach(() => {
    delete process.env.THROTTLE_SKIP_IPS;
  });

  it('por defecto exime solo loopback', () => {
    expect(parseThrottleSkipIps({})).toEqual(DEFAULT_THROTTLE_SKIP_IPS);
    expect(
      parseThrottleSkipIps({ THROTTLE_SKIP_IPS: ' 10.0.0.1, ,1.2.3.4 ' }),
    ).toEqual(['10.0.0.1', '1.2.3.4']);
    expect(parseThrottleSkipIps({ THROTTLE_SKIP_IPS: '' })).toEqual([]);
  });

  it('usa req.ip como tracker y no limita llamadas internas', async () => {
    const guard = new AppThrottlerGuard([] as any, {} as any, new Reflector());
    await expect(
      (guard as any).getTracker({ ip: '203.0.113.9' }),
    ).resolves.toBe('203.0.113.9');
    await expect((guard as any).shouldSkip(ctx('127.0.0.1'))).resolves.toBe(
      true,
    );
    await expect((guard as any).shouldSkip(ctx('203.0.113.9'))).resolves.toBe(
      false,
    );
  });

  it('respeta THROTTLE_SKIP_IPS', async () => {
    process.env.THROTTLE_SKIP_IPS = '198.51.100.7';
    const guard = new AppThrottlerGuard([] as any, {} as any, new Reflector());
    await expect((guard as any).shouldSkip(ctx('198.51.100.7'))).resolves.toBe(
      true,
    );
    await expect((guard as any).shouldSkip(ctx('127.0.0.1'))).resolves.toBe(
      false,
    );
  });

  describe('IP del visitante reenviada por el portal/backoffice', () => {
    const httpCtx = (req: Record<string, unknown>) =>
      ({ getType: () => 'http', switchToHttp: () => ({ getRequest: () => req }) }) as any;
    const guard = () => new AppThrottlerGuard([] as any, {} as any, new Reflector());

    it('desde localhost con x-client-ip limita por esa IP (no se exime)', async () => {
      const req = { ip: '127.0.0.1', headers: { 'x-client-ip': '203.0.113.50' } };
      await expect((guard() as any).getTracker(req)).resolves.toBe('203.0.113.50');
      await expect((guard() as any).shouldSkip(httpCtx(req))).resolves.toBe(false);
    });

    it('desde localhost sin cabecera sigue exento (SSR interno)', async () => {
      await expect((guard() as any).shouldSkip(httpCtx({ ip: '127.0.0.1', headers: {} }))).resolves.toBe(true);
    });

    it('ignora x-client-ip de un visitante externo (no puede suplantar otra IP)', async () => {
      const req = { ip: '198.51.100.20', headers: { 'x-client-ip': '203.0.113.50' } };
      await expect((guard() as any).getTracker(req)).resolves.toBe('198.51.100.20');
    });

    it('ignora valores que no son una IP', async () => {
      const req = { ip: '127.0.0.1', headers: { 'x-client-ip': 'no-es-ip' } };
      await expect((guard() as any).getTracker(req)).resolves.toBe('127.0.0.1');
      await expect((guard() as any).shouldSkip(httpCtx(req))).resolves.toBe(true);
    });
  });
});

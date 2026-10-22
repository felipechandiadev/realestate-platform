/**
 * Tests unitarios (sin BD ni red) de los guards globales deny-by-default.
 * Se registra una estrategia passport 'jwt' falsa: "Bearer valid-<ROL>" autentica.
 */
import {
  Controller,
  ExecutionContext,
  Get,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const passport = require('passport');
import { Strategy as CustomStrategy } from 'passport-custom';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Public } from '../decorators/public.decorator';
import { Roles } from '../decorators/roles.decorator';
import { UserRole } from '../../../users/domain/user.entity';

@Controller('test')
class TestController {
  @Public()
  @Get('open')
  open() {}

  @Get('closed')
  closed() {}

  @Roles(UserRole.ADMIN)
  @Get('admin')
  adminOnly() {}
}

@Public()
@Controller('public-class')
class PublicClassController {
  @Get()
  anything() {}
}

function ctxFor(
  cls: any,
  handler: (...args: any[]) => any,
  req: any,
  type: 'http' | 'ws' = 'http',
): ExecutionContext {
  const host = new ExecutionContextHost(
    [req, {}, () => undefined],
    cls,
    handler,
  );
  host.setType(type);
  return host;
}

const audienceFor = (role: string) =>
  role === UserRole.COMMUNITY ? 'community' : 'staff';

describe('Guards globales (JwtAuthGuard + RolesGuard)', () => {
  const reflector = new Reflector();
  const jweService = {
    decrypt: jest.fn().mockRejectedValue(new Error('invalid')),
  } as any;
  let jwtGuard: JwtAuthGuard;
  let rolesGuard: RolesGuard;

  beforeAll(() => {
    passport.use(
      'jwt',
      new CustomStrategy((req: any, done: any) => {
        const header: string = req.headers?.authorization || '';
        const match = header.match(/^Bearer valid-(\w+)$/);
        if (!match) return done(null, false);
        const role = match[1];
        return done(null, {
          id: `user-${role}`,
          role,
          authAudience: audienceFor(role),
        });
      }),
    );
  });

  beforeEach(() => {
    jwtGuard = new JwtAuthGuard(jweService, reflector);
    rolesGuard = new RolesGuard(reflector);
  });

  const run = async (cls: any, handler: any, req: any) => {
    const ctx = ctxFor(cls, handler, req);
    const a = await jwtGuard.canActivate(ctx);
    const b = rolesGuard.canActivate(ctx);
    return a && b;
  };

  it('@Public() deja pasar a un anónimo', async () => {
    const req = { headers: {} };
    await expect(
      run(TestController, TestController.prototype.open, req),
    ).resolves.toBe(true);
    expect((req as any).user).toBeUndefined();
  });

  it('@Public() a nivel de clase deja pasar a un anónimo', async () => {
    const req = { headers: {} };
    await expect(
      run(PublicClassController, PublicClassController.prototype.anything, req),
    ).resolves.toBe(true);
  });

  it('@Public() con token inválido igualmente pasa (sin req.user)', async () => {
    const req: any = { headers: { authorization: 'Bearer basura' } };
    await expect(
      run(TestController, TestController.prototype.open, req),
    ).resolves.toBe(true);
    expect(req.user).toBeFalsy();
  });

  it('@Public() con token válido puebla req.user', async () => {
    const req: any = {
      headers: { authorization: `Bearer valid-${UserRole.COMMUNITY}` },
    };
    await expect(
      run(TestController, TestController.prototype.open, req),
    ).resolves.toBe(true);
    expect(req.user?.id).toBe(`user-${UserRole.COMMUNITY}`);
  });

  it('una ruta sin @Public() rechaza al anónimo (401)', async () => {
    const ctx = ctxFor(TestController, TestController.prototype.closed, {
      headers: {},
    });
    await expect(jwtGuard.canActivate(ctx)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('RolesGuard sin @Roles exige usuario autenticado', () => {
    const ctx = ctxFor(TestController, TestController.prototype.closed, {
      headers: {},
    });
    expect(() => rolesGuard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('una ruta sin @Roles admite a cualquier usuario autenticado', async () => {
    const req = {
      headers: { authorization: `Bearer valid-${UserRole.COMMUNITY}` },
    };
    await expect(
      run(TestController, TestController.prototype.closed, req),
    ).resolves.toBe(true);
  });

  it('RolesGuard rechaza COMMUNITY en una ruta ADMIN (403)', async () => {
    const req = {
      headers: { authorization: `Bearer valid-${UserRole.COMMUNITY}` },
    };
    const ctx = ctxFor(TestController, TestController.prototype.adminOnly, req);
    await expect(jwtGuard.canActivate(ctx)).resolves.toBe(true);
    expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('RolesGuard rechaza AGENT en una ruta ADMIN (403)', async () => {
    const req = {
      headers: { authorization: `Bearer valid-${UserRole.AGENT}` },
    };
    const ctx = ctxFor(TestController, TestController.prototype.adminOnly, req);
    await jwtGuard.canActivate(ctx);
    expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('RolesGuard permite ADMIN en una ruta ADMIN', async () => {
    const req = {
      headers: { authorization: `Bearer valid-${UserRole.ADMIN}` },
    };
    await expect(
      run(TestController, TestController.prototype.adminOnly, req),
    ).resolves.toBe(true);
  });

  it('los contextos no-HTTP (WebSocket) no se ven afectados', async () => {
    const ctx = ctxFor(
      TestController,
      TestController.prototype.closed,
      { headers: {} },
      'ws',
    );
    await expect(jwtGuard.canActivate(ctx)).resolves.toBe(true);
    expect(rolesGuard.canActivate(ctx)).toBe(true);
  });
});

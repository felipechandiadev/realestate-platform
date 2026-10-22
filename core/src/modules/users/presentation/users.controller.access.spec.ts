/**
 * Tests unitarios (todo mockeado, sin BD) del control de acceso de UsersController.
 */
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { UsersController } from './users.controller';
import { RolesGuard } from '../../auth/presentation/guards/roles.guard';
import { UserRole } from '../domain/user.entity';

const actor = (role: UserRole, id = `id-${role}`) => ({
  id,
  role,
  authAudience: role === UserRole.COMMUNITY ? 'community' : 'staff',
});

function ctxFor(handler: (...args: any[]) => any, user: any): ExecutionContext {
  const host = new ExecutionContextHost(
    [{ headers: {}, user }, {}, () => undefined],
    UsersController,
    handler,
  );
  host.setType('http');
  return host;
}

describe('UsersController - control de acceso', () => {
  const usersService = {
    update: jest.fn().mockResolvedValue({ ok: true }),
    findOne: jest.fn().mockResolvedValue({ id: 'x' }),
    changePassword: jest.fn().mockResolvedValue(undefined),
    updateUserAvatar: jest
      .fn()
      .mockResolvedValue({ personalInfo: { avatarUrl: 'u' } }),
    assertPersonLinkableByUser: jest.fn().mockResolvedValue(undefined),
    assignRole: jest.fn(),
  };
  const controller = new UsersController(usersService as any);
  const rolesGuard = new RolesGuard(new Reflector());

  beforeEach(() => jest.clearAllMocks());

  describe('PATCH :id/role (y status/permissions/delete) solo ADMIN', () => {
    const adminOnly = [
      'assignRole',
      'setStatus',
      'setPermissions',
      'softDelete',
    ] as const;

    it.each(adminOnly)('%s rechaza a COMMUNITY', (method) => {
      const ctx = ctxFor(
        (UsersController.prototype as any)[method],
        actor(UserRole.COMMUNITY),
      );
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it.each(adminOnly)('%s rechaza a AGENT', (method) => {
      const ctx = ctxFor(
        (UsersController.prototype as any)[method],
        actor(UserRole.AGENT),
      );
      expect(() => rolesGuard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it.each(adminOnly)('%s permite a ADMIN', (method) => {
      const ctx = ctxFor(
        (UsersController.prototype as any)[method],
        actor(UserRole.ADMIN),
      );
      expect(rolesGuard.canActivate(ctx)).toBe(true);
    });
  });

  describe('PATCH :id (update) dueño o ADMIN', () => {
    it('el dueño puede actualizarse, pero no cambia role/status/permissions', async () => {
      const me = actor(UserRole.COMMUNITY, 'u1');
      await controller.update(
        'u1',
        {
          username: 'nuevo',
          role: UserRole.ADMIN,
          status: 'ACTIVE',
          permissions: ['x'],
        } as any,
        { user: me },
      );
      expect(usersService.update).toHaveBeenCalledWith('u1', {
        username: 'nuevo',
      });
    });

    it('un COMMUNITY no puede actualizar a otro usuario', async () => {
      await expect(
        controller.update('otro', { username: 'x' } as any, {
          user: actor(UserRole.COMMUNITY, 'u1'),
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(usersService.update).not.toHaveBeenCalled();
    });

    it('un AGENT no puede actualizar a otro usuario', async () => {
      await expect(
        controller.update('otro', { username: 'x' } as any, {
          user: actor(UserRole.AGENT, 'a1'),
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('ADMIN puede actualizar a otro usuario, incluido el rol', async () => {
      await controller.update('otro', { role: UserRole.AGENT } as any, {
        user: actor(UserRole.ADMIN),
      });
      expect(usersService.update).toHaveBeenCalledWith('otro', {
        role: UserRole.AGENT,
      });
    });

    it('un no-ADMIN que envía personId pasa por la verificación de propiedad', async () => {
      await controller.update('u1', { personId: 'p1' } as any, {
        user: actor(UserRole.COMMUNITY, 'u1'),
      });
      expect(usersService.assertPersonLinkableByUser).toHaveBeenCalledWith(
        'p1',
        'u1',
      );
    });

    it('si la persona no le pertenece, no se actualiza', async () => {
      usersService.assertPersonLinkableByUser.mockRejectedValueOnce(
        new ForbiddenException(),
      );
      await expect(
        controller.update('u1', { personId: 'ajena' } as any, {
          user: actor(UserRole.COMMUNITY, 'u1'),
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(usersService.update).not.toHaveBeenCalled();
    });
  });

  describe('otros endpoints con dueño', () => {
    it('change-password: otro usuario no-ADMIN es rechazado', async () => {
      await expect(
        controller.changePassword('otro', {} as any, {
          user: actor(UserRole.AGENT, 'a1'),
        }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(usersService.changePassword).not.toHaveBeenCalled();
    });

    it('avatar: el dueño puede', async () => {
      await controller.updateUserAvatar('u1', {} as any, {
        user: actor(UserRole.COMMUNITY, 'u1'),
      });
      expect(usersService.updateUserAvatar).toHaveBeenCalled();
    });

    it('GET :id: COMMUNITY no puede ver a otro usuario; AGENT sí', () => {
      expect(() =>
        controller.findOne('otro', { user: actor(UserRole.COMMUNITY, 'u1') }),
      ).toThrow(ForbiddenException);
      controller.findOne('otro', { user: actor(UserRole.AGENT) });
      expect(usersService.findOne).toHaveBeenCalledWith('otro');
    });
  });
});

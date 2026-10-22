/** Tests unitarios (mockeados, sin BD) del control de acceso a notificaciones (IDOR). */
import { ForbiddenException } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import {
  canAccessNotification,
  isStaffActor,
  actorIdOf,
} from './notification-access.util';
import { UserRole } from '../../users/domain/user.entity';
import { ROLES_KEY } from '../../auth/presentation/decorators/roles.decorator';

describe('canAccessNotification', () => {
  const notif = { targetUserIds: ['u1', 'u2'] };

  it('staff siempre puede', () => {
    expect(
      canAccessNotification({ id: 'x', role: UserRole.ADMIN }, notif),
    ).toBe(true);
    expect(
      canAccessNotification({ id: 'x', role: UserRole.AGENT }, notif),
    ).toBe(true);
    expect(isStaffActor({ role: UserRole.COMMUNITY })).toBe(false);
  });

  it('COMMUNITY solo si es destinatario', () => {
    expect(
      canAccessNotification({ id: 'u1', role: UserRole.COMMUNITY }, notif),
    ).toBe(true);
    expect(
      canAccessNotification({ sub: 'u2', role: UserRole.COMMUNITY }, notif),
    ).toBe(true);
    expect(
      canAccessNotification({ id: 'u9', role: UserRole.COMMUNITY }, notif),
    ).toBe(false);
    expect(
      canAccessNotification(
        { id: 'u1', role: UserRole.COMMUNITY },
        { targetUserIds: null },
      ),
    ).toBe(false);
    expect(canAccessNotification(undefined, notif)).toBe(false);
    expect(actorIdOf({ sub: 'abc' })).toBe('abc');
  });
});

describe('NotificationsController - acceso por dueño', () => {
  const service = {
    findOne: jest.fn(),
    getNotificationById: jest.fn().mockResolvedValue({ id: 'n1' }),
    markAsOpened: jest.fn().mockResolvedValue({ id: 'n1' }),
    updateStatus: jest.fn().mockResolvedValue({ id: 'n1' }),
  };
  const controller = new NotificationsController(service as any, {} as any);
  const owner = { user: { id: 'u1', role: UserRole.COMMUNITY } } as any;
  const other = { user: { id: 'u9', role: UserRole.COMMUNITY } } as any;
  const agent = { user: { id: 'a1', role: UserRole.AGENT } } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service.findOne.mockResolvedValue({ id: 'n1', targetUserIds: ['u1'] });
  });

  it('GET :id: ajeno → 403, dueño y staff → OK', async () => {
    await expect(controller.findOne('n1', other)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(service.getNotificationById).not.toHaveBeenCalled();
    await expect(controller.findOne('n1', owner)).resolves.toEqual({
      id: 'n1',
    });
    await expect(controller.findOne('n1', agent)).resolves.toEqual({
      id: 'n1',
    });
  });

  it('PATCH :id/status: ajeno → 403', async () => {
    await expect(
      controller.updateStatus('n1', { status: 'READ' } as any, other),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(service.updateStatus).not.toHaveBeenCalled();
    await controller.updateStatus('n1', { status: 'READ' } as any, owner);
    expect(service.updateStatus).toHaveBeenCalledWith('n1', 'READ');
  });

  it('POST :id/open: un no-staff solo se registra a sí mismo como lector', async () => {
    await expect(
      controller.markAsOpened('n1', 'u1', other),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await controller.markAsOpened('n1', 'otro-usuario', owner);
    expect(service.markAsOpened).toHaveBeenCalledWith('n1', 'u1');
    await controller.markAsOpened('n1', 'u1', agent);
    expect(service.markAsOpened).toHaveBeenLastCalledWith('n1', 'u1');
  });

  it('crear, listar todo, editar y borrar quedan solo para ADMIN/AGENT', () => {
    for (const method of ['create', 'findAll', 'update', 'softDelete']) {
      const roles = Reflect.getMetadata(
        ROLES_KEY,
        (NotificationsController.prototype as any)[method],
      );
      expect(roles).toEqual(
        expect.arrayContaining([UserRole.ADMIN, UserRole.AGENT]),
      );
      expect(roles).not.toContain(UserRole.COMMUNITY);
    }
  });
});

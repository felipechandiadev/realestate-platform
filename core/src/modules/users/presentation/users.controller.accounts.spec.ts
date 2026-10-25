import { ForbiddenException, ValidationPipe } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from '../application/users.service';
import { UserRole } from '../domain/user.entity';
import { ChangePasswordDto, CreateUserDto } from '../dto/user.dto';
import { ROLES_KEY } from '../../auth/presentation/decorators/roles.decorator';

describe('UsersController (cuentas)', () => {
  const service = {
    create: jest.fn((dto: CreateUserDto) => Promise.resolve({ id: 'new', ...dto })),
    setStatus: jest.fn(),
    assignRole: jest.fn(),
    softDelete: jest.fn(),
  };
  const controller = new UsersController(service as unknown as UsersService);
  const as = (role: UserRole, id = `${role}-1`) => ({ user: { id, role } });
  const dto = (role?: UserRole) =>
    ({ username: 'x', email: 'x@example.com', password: 'Segura123', role }) as CreateUserDto;

  beforeEach(() => jest.clearAllMocks());

  it('un agente solo puede crear clientes', async () => {
    await expect(controller.create(dto(UserRole.COMMUNITY), as(UserRole.AGENT))).resolves.toBeDefined();
    await expect(controller.create(dto(), as(UserRole.AGENT))).resolves.toBeDefined();
    await expect(controller.create(dto(UserRole.AGENT), as(UserRole.AGENT))).rejects.toThrow(ForbiddenException);
    await expect(controller.create(dto(UserRole.ADMIN), as(UserRole.AGENT))).rejects.toThrow(ForbiddenException);
    await expect(controller.create(dto(UserRole.AGENT), as(UserRole.ADMIN))).resolves.toBeDefined();
  });

  it('el listado general de usuarios es solo para ADMIN', () => {
    const roles = Reflect.getMetadata(ROLES_KEY, UsersController.prototype.findAll) as UserRole[];
    expect(roles).toEqual([UserRole.ADMIN]);
  });

  it('pasa quién hace el cambio para impedir auto-bloqueos', async () => {
    const req = as(UserRole.ADMIN, 'admin-1');
    await controller.setStatus('u2', 'INACTIVE' as never, req);
    await controller.assignRole('u2', { role: UserRole.AGENT }, req);
    await controller.softDelete('u2', req);
    expect(service.setStatus).toHaveBeenCalledWith('u2', 'INACTIVE', 'admin-1');
    expect(service.assignRole).toHaveBeenCalledWith('u2', UserRole.AGENT, 'admin-1');
    expect(service.softDelete).toHaveBeenCalledWith('u2', 'admin-1');
  });
});

describe('Contraseñas', () => {
  const pipe = new ValidationPipe({ whitelist: true });

  it('exige al menos 8 caracteres al crear usuarios y al cambiar contraseña', async () => {
    await expect(
      pipe.transform({ username: 'x', email: 'x@example.com', password: '1' }, { type: 'body', metatype: CreateUserDto }),
    ).rejects.toMatchObject({
      response: { message: expect.arrayContaining(['La contraseña debe tener al menos 8 caracteres']) },
    });
    await expect(
      pipe.transform({ currentPassword: 'vieja', newPassword: 'corta' }, { type: 'body', metatype: ChangePasswordDto }),
    ).rejects.toBeDefined();
    await expect(
      pipe.transform({ username: 'x', email: 'x@example.com', password: 'Segura123' }, { type: 'body', metatype: CreateUserDto }),
    ).resolves.toBeDefined();
  });
});

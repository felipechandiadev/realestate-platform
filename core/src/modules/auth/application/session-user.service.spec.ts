import { UnauthorizedException } from '@nestjs/common';
import { SessionUserService } from './session-user.service';
import { UserRole, UserStatus } from '../../users/domain/user.entity';

describe('SessionUserService', () => {
  const build = () => {
    const repo = { findOne: jest.fn() };
    return { repo, service: new SessionUserService(repo as never) };
  };

  it('devuelve el rol vigente de la base, no el del token', async () => {
    const { repo, service } = build();
    repo.findOne.mockResolvedValue({ id: 'u1', role: UserRole.AGENT, status: UserStatus.ACTIVE });
    await expect(service.assertActive('u1')).resolves.toBe(UserRole.AGENT);
  });

  it('rechaza usuarios eliminados o no activos', async () => {
    const { repo, service } = build();
    repo.findOne.mockResolvedValueOnce(null);
    await expect(service.assertActive('borrado')).rejects.toThrow('Tu cuenta ya no existe');

    repo.findOne.mockResolvedValueOnce({ id: 'u2', role: UserRole.AGENT, status: UserStatus.INACTIVE });
    await expect(service.assertActive('u2')).rejects.toThrow('Tu cuenta está inactiva');

    await expect(service.assertActive(undefined)).rejects.toThrow(UnauthorizedException);
  });

  it('reutiliza la consulta unos segundos y la olvida al invalidar', async () => {
    const { repo, service } = build();
    repo.findOne.mockResolvedValue({ id: 'u1', role: UserRole.ADMIN, status: UserStatus.ACTIVE });

    await service.assertActive('u1');
    await service.assertActive('u1');
    expect(repo.findOne).toHaveBeenCalledTimes(1);

    repo.findOne.mockResolvedValue({ id: 'u1', role: UserRole.ADMIN, status: UserStatus.INACTIVE });
    service.invalidate('u1');
    await expect(service.assertActive('u1')).rejects.toThrow('Tu cuenta está inactiva');
    expect(repo.findOne).toHaveBeenCalledTimes(2);
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.usecase';
import { UserRole, UserStatus } from '../../domain/user.entity';

describe('LoginUseCase', () => {
  const build = (user: Record<string, unknown> | null) => {
    const repo = {
      findOneWithPassword: jest.fn(() => Promise.resolve(user)),
      update: jest.fn(() => Promise.resolve()),
    };
    return { repo, useCase: new LoginUseCase(repo as never) };
  };
  const staff = (over: Record<string, unknown> = {}) => ({
    id: 'u1',
    role: UserRole.AGENT,
    status: UserStatus.ACTIVE,
    emailVerified: true,
    validatePassword: jest.fn(() => Promise.resolve(true)),
    ...over,
  });

  it('registra el último acceso al entrar', async () => {
    const { repo, useCase } = build(staff());
    const before = Date.now();
    await useCase.execute({ email: 'a@b.cl', password: 'x' } as never);
    const [[id, patch]] = repo.update.mock.calls as unknown as Array<
      [string, { lastLogin: Date }]
    >;
    expect(id).toBe('u1');
    expect(patch.lastLogin.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('no registra acceso si la contraseña falla o la cuenta está inactiva', async () => {
    const wrong = build(
      staff({ validatePassword: jest.fn(() => Promise.resolve(false)) }),
    );
    await expect(
      wrong.useCase.execute({ email: 'a@b.cl', password: 'x' } as never),
    ).rejects.toThrow(UnauthorizedException);
    expect(wrong.repo.update).not.toHaveBeenCalled();

    const inactive = build(staff({ status: UserStatus.INACTIVE }));
    await expect(
      inactive.useCase.execute({ email: 'a@b.cl', password: 'x' } as never),
    ).rejects.toThrow('Usuario inactivo.');
    expect(inactive.repo.update).not.toHaveBeenCalled();
  });
});

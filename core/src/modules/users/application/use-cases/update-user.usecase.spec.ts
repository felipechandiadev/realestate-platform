import { UpdateUserUseCase } from './update-user.usecase';
import type { UserRepository } from '../../domain/user.repository';

describe('UpdateUserUseCase', () => {
  const buildRepo = (user: Record<string, unknown>) =>
    ({
      findOne: jest.fn().mockResolvedValue(user),
      save: jest.fn().mockImplementation(async (u) => u),
    }) as unknown as UserRepository;

  it('combina personalInfo en vez de reemplazarlo (no borra avatarUrl)', async () => {
    const user = {
      id: 'u1',
      username: 'agent3',
      email: 'agent3@re.cl',
      personalInfo: { firstName: 'José', avatarUrl: '/avatars/a.jpg', nationality: 'Chilena' },
    };
    const useCase = new UpdateUserUseCase(buildRepo(user));

    const saved = await useCase.execute('u1', { personalInfo: { firstName: 'Pepe', phone: '+56911112222' } } as never);

    expect(saved.personalInfo).toEqual({
      firstName: 'Pepe',
      phone: '+56911112222',
      avatarUrl: '/avatars/a.jpg',
      nationality: 'Chilena',
    });
  });

  it('ignora claves en undefined (no pisan lo guardado)', async () => {
    const user = { id: 'u3', username: 'y', email: 'y@re.cl', personalInfo: { avatarUrl: '/a.jpg' } };
    const useCase = new UpdateUserUseCase(buildRepo(user));

    const saved = await useCase.execute('u3', { personalInfo: { firstName: 'Eva', avatarUrl: undefined } } as never);

    expect(saved.personalInfo).toEqual({ firstName: 'Eva', avatarUrl: '/a.jpg' });
  });

  it('crea personalInfo si el usuario no tenía', async () => {
    const user = { id: 'u2', username: 'x', email: 'x@re.cl' };
    const useCase = new UpdateUserUseCase(buildRepo(user));

    const saved = await useCase.execute('u2', { personalInfo: { firstName: 'Ana' } } as never);

    expect(saved.personalInfo).toEqual({ firstName: 'Ana' });
  });
});

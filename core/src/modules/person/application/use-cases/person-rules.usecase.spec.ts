/* eslint-disable @typescript-eslint/unbound-method -- aserciones sobre mocks de jest */
import { BadRequestException, ConflictException } from '@nestjs/common';
import { CreatePersonUseCase } from './create-person.usecase';
import { UpdatePersonUseCase } from './update-person.usecase';
import { LinkUserUseCase } from './link-user.usecase';
import { UnlinkUserUseCase } from './unlink-user.usecase';
import { VerifyPersonUseCase } from './verify-person.usecase';
import { UnverifyPersonUseCase } from './unverify-person.usecase';
import { PersonRepository } from '../../domain/person.repository';
import { Person } from '../../domain/person.entity';

const makeRepo = () =>
  ({
    save: jest.fn((p: Person) =>
      Promise.resolve({ ...p, id: p.id ?? 'new-id' }),
    ),
    findById: jest.fn(),
    findByDni: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  }) as unknown as jest.Mocked<PersonRepository>;

const person = (over: Partial<Person> = {}) =>
  ({
    id: undefined,
    name: 'Ana',
    dni: '12.345.678-9',
    verified: false,
    ...over,
  }) as unknown as Person;

describe('CreatePersonUseCase', () => {
  it('guarda el RUT normalizado', async () => {
    const repo = makeRepo();
    repo.findByDni.mockResolvedValue(null);

    await new CreatePersonUseCase(repo).execute(person());

    expect(repo.findByDni).toHaveBeenCalledWith('12345678-9');
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '12345678-9' }),
    );
  });

  it('rechaza un RUT que ya existe aunque esté escrito distinto', async () => {
    const repo = makeRepo();
    repo.findByDni.mockResolvedValue({
      id: 'p1',
      dni: '123456789',
      deletedAt: null,
    } as unknown as Person);

    await expect(
      new CreatePersonUseCase(repo).execute(person()),
    ).rejects.toThrow(
      new ConflictException('Ya existe una persona con ese RUT'),
    );
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('si el RUT es de una ficha eliminada, la restaura con los datos nuevos', async () => {
    const repo = makeRepo();
    repo.findByDni.mockResolvedValue({
      id: 'old',
      dni: '12345678-9',
      deletedAt: new Date(),
    } as unknown as Person);
    repo.findById.mockResolvedValue({
      id: 'old',
      name: 'Ana',
      dni: '12345678-9',
    } as unknown as Person);

    const result = await new CreatePersonUseCase(repo).execute(
      person({ name: 'Ana' }),
    );

    expect(repo.update).toHaveBeenCalledWith(
      'old',
      expect.objectContaining({
        name: 'Ana',
        dni: '12345678-9',
        deletedAt: null,
      }),
    );
    expect(repo.save).not.toHaveBeenCalled();
    expect(result.id).toBe('old');
  });
});

describe('UpdatePersonUseCase', () => {
  it('rechaza cambiar al RUT de otra persona', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(person({ id: 'p1', dni: '11111111-1' }));
    repo.findByDni.mockResolvedValue({
      id: 'p2',
      deletedAt: null,
    } as unknown as Person);

    await expect(
      new UpdatePersonUseCase(repo).execute('p1', { dni: '12.345.678-9' }),
    ).rejects.toThrow('Ya existe una persona con ese RUT');
  });

  it('permite guardar su propio RUT con otro formato', async () => {
    const repo = makeRepo();
    repo.findById.mockResolvedValue(person({ id: 'p1', dni: '123456789' }));
    repo.findByDni.mockResolvedValue({
      id: 'p1',
      deletedAt: null,
    } as unknown as Person);

    await new UpdatePersonUseCase(repo).execute('p1', { dni: '12.345.678-9' });
    expect(repo.save).toHaveBeenCalledWith(
      expect.objectContaining({ dni: '12345678-9' }),
    );
  });
});

describe('LinkUserUseCase', () => {
  it('vincula el usuario indicado (no el id de la persona)', async () => {
    const repo = makeRepo();
    repo.findOne
      .mockResolvedValueOnce({
        id: 'p1',
        user: undefined,
        userId: undefined,
      } as unknown as Person)
      .mockResolvedValueOnce(null);

    await new LinkUserUseCase(repo).execute('p1', 'user-9');

    expect(repo.update).toHaveBeenCalledWith('p1', { userId: 'user-9' });
  });

  it('rechaza si el usuario ya tiene otra ficha', async () => {
    const repo = makeRepo();
    repo.findOne
      .mockResolvedValueOnce({ id: 'p1' } as unknown as Person)
      .mockResolvedValueOnce({ id: 'p2', name: 'Luis' } as unknown as Person);

    await expect(
      new LinkUserUseCase(repo).execute('p1', 'user-9'),
    ).rejects.toThrow('Ese usuario ya está vinculado a otra persona (Luis)');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rechaza si la persona ya tiene usuario o no se indica uno', async () => {
    const repo = makeRepo();
    repo.findOne.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
    } as unknown as Person);
    await expect(
      new LinkUserUseCase(repo).execute('p1', 'user-9'),
    ).rejects.toThrow(BadRequestException);
    await expect(new LinkUserUseCase(repo).execute('p1', '')).rejects.toThrow(
      'Debes indicar el usuario',
    );
  });
});

describe('UnlinkUserUseCase', () => {
  it('limpia userId en la base (antes quedaba vinculado)', async () => {
    const repo = makeRepo();
    repo.findOne.mockResolvedValue({
      id: 'p1',
      userId: 'u1',
      user: { id: 'u1' },
    } as unknown as Person);

    await new UnlinkUserUseCase(repo).execute('p1');

    expect(repo.update).toHaveBeenCalledWith('p1', { userId: null });
    expect(repo.save).not.toHaveBeenCalled();
  });
});

describe('verificación', () => {
  it('verificar y quitar la verificación limpian la solicitud pendiente', async () => {
    const repo = makeRepo();
    const pending = new Date();
    repo.findOne.mockResolvedValueOnce({
      id: 'p1',
      verified: false,
      verificationRequest: pending,
    } as unknown as Person);
    await new VerifyPersonUseCase(repo).execute('p1');
    expect(repo.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ verified: true, verificationRequest: null }),
    );

    repo.findOne.mockResolvedValueOnce({
      id: 'p1',
      verified: true,
      verificationRequest: pending,
    } as unknown as Person);
    await new UnverifyPersonUseCase(repo).execute('p1');
    expect(repo.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ verified: false, verificationRequest: null }),
    );
  });
});

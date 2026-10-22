/** Tests unitarios (mockeados, sin BD) del acceso COMMUNITY a /people. */
import { ForbiddenException } from '@nestjs/common';
import { PersonController } from './person.controller';
import { UserRole } from '../../users/domain/user.entity';

describe('PersonController - acceso COMMUNITY', () => {
  const personService = {
    create: jest.fn().mockResolvedValue({ id: 'p1' }),
    update: jest.fn().mockResolvedValue({ id: 'p1' }),
    findOne: jest.fn().mockResolvedValue({ id: 'p1' }),
    isOwnedByUser: jest.fn(),
  };
  const controller = new PersonController(personService as any);
  const community = { user: { id: 'u1', role: UserRole.COMMUNITY } };
  const agent = { user: { id: 'a1', role: UserRole.AGENT } };

  beforeEach(() => jest.clearAllMocks());

  it('POST: COMMUNITY crea su ficha con userId del token y sin campos de verificación', async () => {
    await controller.create(
      {
        name: 'X',
        userId: 'otro',
        verified: true,
        verificationRequest: true,
      } as any,
      community,
    );
    expect(personService.create).toHaveBeenCalledWith({
      name: 'X',
      userId: 'u1',
    });
  });

  it('POST: AGENT conserva el body tal cual', async () => {
    const dto = { name: 'X', userId: 'otro', verified: true } as any;
    await controller.create(dto, agent);
    expect(personService.create).toHaveBeenCalledWith(dto);
  });

  it('PATCH/GET: COMMUNITY no puede tocar una ficha ajena', async () => {
    personService.isOwnedByUser.mockResolvedValue(false);
    await expect(
      controller.update('p9', { name: 'Y' } as any, community),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(controller.findOne('p9', community)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(personService.update).not.toHaveBeenCalled();
  });

  it('PATCH: COMMUNITY sobre su ficha, sin poder marcarse verificado', async () => {
    personService.isOwnedByUser.mockResolvedValue(true);
    await controller.update(
      'p1',
      { name: 'Y', verified: true, userId: 'otro' } as any,
      community,
    );
    expect(personService.update).toHaveBeenCalledWith('p1', { name: 'Y' });
  });

  it('GET: AGENT no pasa por la verificación de propiedad', async () => {
    await controller.findOne('p9', agent);
    expect(personService.isOwnedByUser).not.toHaveBeenCalled();
  });
});

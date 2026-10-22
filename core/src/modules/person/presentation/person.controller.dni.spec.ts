/** Tests unitarios (mockeados, sin BD): imágenes de carnet ajenas no se pueden vincular. */
import { ForbiddenException } from '@nestjs/common';
import { PersonController } from './person.controller';
import { UserRole } from '../../users/domain/user.entity';

describe('PersonController - propiedad de imágenes de carnet', () => {
  const personService = {
    create: jest.fn().mockResolvedValue({ id: 'p1' }),
    update: jest.fn().mockResolvedValue({ id: 'p1' }),
    isOwnedByUser: jest.fn().mockResolvedValue(true),
    areMultimediaOwnedByUser: jest.fn(),
  };
  const controller = new PersonController(personService as any);
  const community = { user: { id: 'u1', role: UserRole.COMMUNITY } };
  const agent = { user: { id: 'a1', role: UserRole.AGENT } };

  beforeEach(() => jest.clearAllMocks());

  it('COMMUNITY con imagen ajena → 403 y no guarda', async () => {
    personService.areMultimediaOwnedByUser.mockResolvedValue(false);
    await expect(
      controller.create(
        { name: 'X', dniCardFrontId: 'm-ajena' } as any,
        community,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      controller.update('p1', { dniCardRearId: 'm-ajena' } as any, community),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(personService.create).not.toHaveBeenCalled();
    expect(personService.update).not.toHaveBeenCalled();
    expect(personService.areMultimediaOwnedByUser).toHaveBeenCalledWith(
      ['m-ajena'],
      'u1',
    );
  });

  it('COMMUNITY con imágenes propias → OK', async () => {
    personService.areMultimediaOwnedByUser.mockResolvedValue(true);
    await controller.update(
      'p1',
      { dniCardFrontId: 'm1', dniCardRearId: 'm2' } as any,
      community,
    );
    expect(personService.areMultimediaOwnedByUser).toHaveBeenCalledWith(
      ['m1', 'm2'],
      'u1',
    );
    expect(personService.update).toHaveBeenCalled();
  });

  it('staff no se valida (el backoffice sube por cuenta de la persona)', async () => {
    await controller.update('p1', { dniCardFrontId: 'm-x' } as any, agent);
    expect(personService.areMultimediaOwnedByUser).not.toHaveBeenCalled();
    expect(personService.update).toHaveBeenCalled();
  });
});

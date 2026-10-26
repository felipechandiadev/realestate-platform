/** Tests unitarios (sin BD): el interés en una propiedad no confía en el cuerpo. */
import { NotFoundException } from '@nestjs/common';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import { NotificationsService } from './notifications.service';

const input = {
  propertyId: 'p1',
  interestedUserName: 'Ana',
  interestedUserEmail: 'ana@x.cl',
  interestedUserPhone: '123',
  interestedUserMessage: 'Hola',
};

function build(property: any) {
  const service: any = Object.create(NotificationsService.prototype);
  service.propertyRepository = { findOne: jest.fn().mockResolvedValue(property) };
  service.notifyInterestOnProperty = jest.fn().mockResolvedValue([]);
  return service;
}

describe('NotificationsService.submitPropertyInterest', () => {
  it('rechaza propiedades inexistentes o no publicadas', async () => {
    await expect(build(null).submitPropertyInterest(input)).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      build({ id: 'p1', status: PropertyStatus.REQUEST }).submitPropertyInterest(input),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('usa el agente de la propiedad y el usuario del token', async () => {
    const service = build({ id: 'p1', status: PropertyStatus.PUBLISHED, assignedAgentId: 'agent-1' });
    await service.submitPropertyInterest(
      { ...input, assignedAgentId: 'otro', interestedUserId: 'suplantado' } as any,
      'real-user',
    );
    expect(service.notifyInterestOnProperty).toHaveBeenCalledWith(
      'p1', 'agent-1', 'real-user', 'Ana', 'ana@x.cl', '123', 'Hola',
    );
  });

  it('anónimo: sin usuario', async () => {
    const service = build({ id: 'p1', status: PropertyStatus.PUBLISHED });
    await service.submitPropertyInterest(input);
    expect(service.notifyInterestOnProperty.mock.calls[0][1]).toBeUndefined();
    expect(service.notifyInterestOnProperty.mock.calls[0][2]).toBeUndefined();
  });
});

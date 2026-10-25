import { BadRequestException } from '@nestjs/common';
import { UpdatePropertyUseCase } from './update-property.usecase';
import { PropertyRepository } from '../../domain/property.repository';
import { NotificationsService } from '../../../notifications/application/notifications.service';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

describe('UpdatePropertyUseCase', () => {
  const findOne = jest.fn();
  const save = jest.fn(async (entity) => entity);
  const createQueryBuilder = jest.fn();
  const managerFindOne = jest.fn();

  const propertyRepository = {
    findOne,
    save,
    createQueryBuilder,
    manager: { findOne: managerFindOne },
  } as unknown as PropertyRepository;

  const notificationsService = {
    notifyAgentAssigned: jest.fn(),
    notifyPropertyStatusChange: jest.fn(),
  } as unknown as NotificationsService;

  const useCase = new UpdatePropertyUseCase(propertyRepository, notificationsService);

  function mockReload(property: Record<string, unknown>) {
    createQueryBuilder.mockReturnValue({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(property),
    });
  }

  beforeEach(() => {
    findOne.mockReset();
    save.mockClear();
    createQueryBuilder.mockReset();
    managerFindOne.mockReset();
    (notificationsService.notifyAgentAssigned as jest.Mock).mockReset();
    (notificationsService.notifyPropertyStatusChange as jest.Mock).mockReset();
  });

  it('allows saving a PUBLISHED property without assigned agent when status does not change', async () => {
    const property = {
      id: 'p1',
      title: 'Old title',
      status: PropertyStatus.PUBLISHED,
      assignedAgentId: undefined,
      changeHistory: [],
    };
    findOne.mockResolvedValue(property);
    mockReload(property);

    await useCase.execute('p1', {
      title: 'New title',
      status: PropertyStatus.PUBLISHED,
    } as any);

    expect(save).toHaveBeenCalled();
    expect(property.title).toBe('New title');
  });

  it('rejects REQUEST → PUBLISHED without assigned agent', async () => {
    const property = {
      id: 'p1',
      status: PropertyStatus.REQUEST,
      assignedAgentId: undefined,
      changeHistory: [],
    };
    findOne.mockResolvedValue(property);

    await expect(
      useCase.execute('p1', { status: PropertyStatus.PUBLISHED } as any),
    ).rejects.toThrow(
      new BadRequestException(
        'Debes asignar un agente antes de cambiar el estado de la propiedad.',
      ),
    );
    expect(save).not.toHaveBeenCalled();
  });

  it('allows REQUEST → PUBLISHED when assignedAgentId is provided', async () => {
    const property = {
      id: 'p1',
      status: PropertyStatus.REQUEST,
      assignedAgentId: undefined,
      changeHistory: [],
      publishedAt: undefined,
    };
    findOne.mockResolvedValue(property);
    mockReload({ ...property, status: PropertyStatus.PUBLISHED, assignedAgentId: 'agent-1' });
    managerFindOne.mockResolvedValue({ id: 'agent-1' });

    await useCase.execute('p1', {
      status: PropertyStatus.PUBLISHED,
      assignedAgentId: 'agent-1',
    } as any);

    expect(save).toHaveBeenCalled();
    expect(property.status).toBe(PropertyStatus.PUBLISHED);
    expect(property.assignedAgentId).toBe('agent-1');
  });

  it('allows PUBLISHED → INACTIVE without assigned agent', async () => {
    const property = {
      id: 'p1',
      status: PropertyStatus.PUBLISHED,
      assignedAgentId: undefined,
      changeHistory: [],
    };
    findOne.mockResolvedValue(property);
    mockReload({ ...property, status: PropertyStatus.INACTIVE });

    await useCase.execute('p1', { status: PropertyStatus.INACTIVE } as any);

    expect(save).toHaveBeenCalled();
    expect(property.status).toBe(PropertyStatus.INACTIVE);
  });

  describe('vaciar campos y destacadas', () => {
    it('vaciar descripción, notas, agente o año los deja en null; un título vacío se ignora', async () => {
      const property: Record<string, unknown> = {
        id: 'p1',
        title: 'Casa',
        description: 'Texto',
        internalNotes: 'Nota',
        assignedAgentId: 'agent-1',
        constructionYear: 1990,
        status: PropertyStatus.INACTIVE,
        changeHistory: [],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', {
        title: '',
        description: '',
        internalNotes: '',
        assignedAgentId: null,
        constructionYear: null,
      } as any);

      expect(property).toMatchObject({
        title: 'Casa',
        description: null,
        internalNotes: null,
        assignedAgentId: null,
        constructionYear: null,
      });
      expect(notificationsService.notifyAgentAssigned).not.toHaveBeenCalled();
    });

    it('al dejar de estar publicada deja de ser destacada', async () => {
      const property: Record<string, unknown> = {
        id: 'p1',
        status: PropertyStatus.PUBLISHED,
        isFeatured: true,
        assignedAgentId: 'agent-1',
        changeHistory: [],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', { status: PropertyStatus.INACTIVE } as any, 'admin-1');

      expect(property.isFeatured).toBe(false);
      expect(property.changeHistory).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'isFeatured', newValue: false })]),
      );
    });
  });
});

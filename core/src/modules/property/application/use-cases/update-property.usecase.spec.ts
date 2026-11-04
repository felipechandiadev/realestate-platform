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

  describe('historial', () => {
    const ctx = { userId: 'u1', channel: 'BACKOFFICE' as const };

    it('guarda anterior, nuevo, autor, origen y agrupa los campos de una misma edición', async () => {
      const property: Record<string, any> = {
        id: 'p1',
        title: 'Casa',
        address: null,
        latitude: null,
        longitude: null,
        status: PropertyStatus.INACTIVE,
        changeHistory: [{ field: 'creation', previousValue: null, newValue: 'Created', changedBy: 'u0' }],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', { address: 'Calle 1', latitude: -33.5, longitude: -70.7 } as any, 'u1', ctx);

      const history = property.changeHistory as any[];
      expect(history).toHaveLength(4); // la creación + 3 cambios
      const added = history.slice(1);
      expect(added.map((e) => [e.field, e.previousValue, e.newValue])).toEqual([
        ['address', null, 'Calle 1'],
        ['latitude', null, -33.5],
        ['longitude', null, -70.7],
      ]);
      expect(new Set(added.map((e) => e.groupId)).size).toBe(1);
      expect(added.every((e) => e.changedBy === 'u1')).toBe(true);
      expect(added.every((e) => e.source?.channel === 'BACKOFFICE' && e.source?.section === 'Ubicación')).toBe(true);
    });

    it('una edición sin cambios reales (listas iguales, decimal como texto) no agrega nada', async () => {
      const property: Record<string, any> = {
        id: 'p1',
        title: 'Casa',
        price: '100000000.00',
        otherFeatures: ['POOL'],
        status: PropertyStatus.INACTIVE,
        changeHistory: [],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', { title: 'Casa', price: 100000000, otherFeatures: ['POOL'] } as any, 'u1', ctx);

      expect(property.changeHistory).toEqual([]);
    });

    it('sin lista previa, enviar una lista vacía no es un cambio', async () => {
      const property: Record<string, any> = { id: 'p1', title: 'Casa', otherFeatures: null, status: PropertyStatus.INACTIVE, changeHistory: [] };
      findOne.mockResolvedValue(property);
      mockReload(property);
      await useCase.execute('p1', { otherFeatures: [] } as any, 'u1', ctx);
      expect(property.changeHistory).toEqual([]);
    });

    it('publicar: el evento queda como publicación y usa el autor del parámetro si el contexto no lo trae', async () => {
      const property: Record<string, any> = {
        id: 'p1',
        title: 'Casa',
        status: PropertyStatus.INACTIVE,
        assignedAgentId: 'ag1',
        changeHistory: [],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', { status: PropertyStatus.PUBLISHED } as any, 'u7', { channel: 'BACKOFFICE' });

      expect(property.changeHistory[0]).toMatchObject({
        field: 'status',
        previousValue: PropertyStatus.INACTIVE,
        newValue: PropertyStatus.PUBLISHED,
        kind: 'PUBLISHED',
        changedBy: 'u7',
        source: { channel: 'BACKOFFICE', section: 'Información básica' },
      });
    });

    it('al despublicar una destacada también queda constancia de que dejó de serlo, en el mismo evento', async () => {
      const property: Record<string, any> = {
        id: 'p1',
        title: 'Casa',
        status: PropertyStatus.PUBLISHED,
        assignedAgentId: 'ag1',
        isFeatured: true,
        changeHistory: [],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', { status: PropertyStatus.INACTIVE } as any, 'u1', ctx);

      const [statusEntry, featuredEntry] = property.changeHistory;
      expect(statusEntry).toMatchObject({ field: 'status', kind: 'UNPUBLISHED' });
      expect(featuredEntry).toMatchObject({ field: 'isFeatured', previousValue: true, newValue: false, source: { section: 'SEO y marketing' } });
      expect(featuredEntry.groupId).toBe(statusEntry.groupId);
    });
  });

  describe('vaciar campos y destacadas', () => {
    it('vaciar descripción, agente o año los deja en null; un título vacío se ignora', async () => {
      const property: Record<string, unknown> = {
        id: 'p1',
        title: 'Casa',
        description: 'Texto',
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
        assignedAgentId: null,
        constructionYear: null,
      } as any);

      expect(property).toMatchObject({
        title: 'Casa',
        description: null,
        assignedAgentId: null,
        constructionYear: null,
      });
      expect(notificationsService.notifyAgentAssigned).not.toHaveBeenCalled();
    });

    it('las notas internas no se cambian por PATCH (ni el texto antiguo ni el listado)', async () => {
      const log = [{ id: 'n1', text: 'Original', authorId: 'u1', authorName: 'Ana', createdAt: '2026-01-01T00:00:00.000Z' }];
      const property: Record<string, unknown> = {
        id: 'p1',
        title: 'Casa',
        internalNotes: 'Texto antiguo',
        internalNotesLog: log,
        status: PropertyStatus.INACTIVE,
        changeHistory: [],
      };
      findOne.mockResolvedValue(property);
      mockReload(property);

      await useCase.execute('p1', {
        title: 'Casa nueva',
        internalNotes: 'hackeado',
        internalNotesLog: [{ id: 'x', text: 'inyectada' }],
      } as any);

      expect(property.title).toBe('Casa nueva');
      expect(property.internalNotes).toBe('Texto antiguo');
      expect(property.internalNotesLog).toBe(log);
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

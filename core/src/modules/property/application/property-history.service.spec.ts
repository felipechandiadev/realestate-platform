import { MultimediaFormat } from '../../multimedia/domain/multimedia.entity';
import { PropertyService } from './property.service';

const ctx = { userId: 'u1', channel: 'BACKOFFICE' as const };

/** Servicio sin DI: solo se asignan las dependencias que usa cada caso. */
function makeService(deps: Record<string, unknown>) {
  const service = Object.create(PropertyService.prototype) as PropertyService;
  Object.assign(service, deps);
  return service as any;
}

/** Eventos que se enviaron a appendPropertyHistory (UPDATE ... changeHistory). */
const appended = (query: jest.Mock): Array<Record<string, any>> =>
  query.mock.calls.flatMap(([, params]) => JSON.parse(params[0]));

describe('PropertyService · historial', () => {
  describe('updateSeoData (antes no quedaba en el historial)', () => {
    const base = () => ({
      id: 'p1',
      status: 'PUBLISHED',
      seoTitle: null,
      seoDescription: 'Vieja',
      seoKeywords: null,
      isFeatured: false,
      changeHistory: [] as any[],
    });

    it('registra título, descripción y destacada con valor anterior, nuevo y origen', async () => {
      const property = base();
      const save = jest.fn(async (p) => p);
      const service = makeService({
        propertyRepository: { findOne: jest.fn().mockResolvedValue(property), save },
        getSeoData: jest.fn().mockResolvedValue({}),
      });

      await service.updateSeoData('p1', { seoTitle: 'Casa linda', seoDescription: 'Nueva', isFeatured: true }, 'u1', ctx);

      expect(property.changeHistory.map((e) => [e.field, e.previousValue, e.newValue])).toEqual([
        ['seoTitle', null, 'Casa linda'],
        ['seoDescription', 'Vieja', 'Nueva'],
        ['isFeatured', false, true],
      ]);
      expect(property.changeHistory.every((e) => e.source?.section === 'SEO y marketing' && e.changedBy === 'u1')).toBe(true);
      expect(new Set(property.changeHistory.map((e) => e.groupId)).size).toBe(1);
      expect(save).toHaveBeenCalled();
    });

    it('si no cambia nada o falla la validación, no queda nada', async () => {
      const same = { ...base(), seoDescription: 'Igual' };
      const s1 = makeService({
        propertyRepository: { findOne: jest.fn().mockResolvedValue(same), save: jest.fn(async (p) => p) },
        getSeoData: jest.fn(),
      });
      await s1.updateSeoData('p1', { seoDescription: 'Igual' }, 'u1', ctx);
      expect(same.changeHistory).toEqual([]);

      const draft = { ...base(), status: 'INACTIVE' };
      const s2 = makeService({
        propertyRepository: { findOne: jest.fn().mockResolvedValue(draft), save: jest.fn() },
        getSeoData: jest.fn(),
      });
      await expect(s2.updateSeoData('p1', { isFeatured: true }, 'u1', ctx)).rejects.toThrow(/publicada/);
      expect(draft.changeHistory).toEqual([]);
    });
  });

  describe('uploadMultimedia (antes no quedaba en el historial)', () => {
    const run = async (opts: { mainImageUrl?: string | null; media: Array<Record<string, any>>; withCtx?: boolean }) => {
      const query = jest.fn().mockResolvedValue(undefined);
      let i = 0;
      const service = makeService({
        findOne: jest.fn().mockResolvedValue({ id: 'p1', mainImageUrl: opts.mainImageUrl ?? null }),
        multimediaService: { uploadFile: jest.fn(async () => ({ ...opts.media[i++] })) },
        multimediaRepository: { save: jest.fn(async (m) => m) },
        propertyRepository: { update: jest.fn(), manager: { query } },
      });
      const files = opts.media.map((m) => ({ mimetype: m.format === MultimediaFormat.IMG ? 'image/jpeg' : 'video/mp4' }));
      await service.uploadMultimedia('p1', files, {}, 'u1', opts.withCtx === false ? undefined : ctx);
      return { query, service };
    };

    it('registra cuántas imágenes y videos se agregaron', async () => {
      const { query } = await run({
        mainImageUrl: 'https://x/ya-tiene.jpg',
        media: [
          { format: MultimediaFormat.IMG, url: 'a.jpg' },
          { format: MultimediaFormat.IMG, url: 'b.jpg' },
          { format: MultimediaFormat.VIDEO, url: 'c.mp4' },
        ],
      });
      const events = appended(query);
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        field: 'multimedia',
        kind: 'MEDIA',
        newValue: 'Se agregaron 2 imágenes y 1 video',
        changedBy: 'u1',
        source: { channel: 'BACKOFFICE', section: 'Multimedia' },
      });
    });

    it('si la propiedad no tenía imagen principal, también queda el cambio de imagen principal (mismo evento)', async () => {
      const { query } = await run({ media: [{ format: MultimediaFormat.IMG, url: 'primera.jpg' }] });
      const events = appended(query);
      expect(events.map((e) => e.field)).toEqual(['multimedia', 'mainImageUrl']);
      expect(events[0].newValue).toBe('Se agregó 1 imagen');
      expect(events[1]).toMatchObject({ previousValue: null, newValue: 'primera.jpg' });
      expect(events[1].groupId).toBe(events[0].groupId);
    });

    it('sin contexto (carga al crear la propiedad) no agrega eventos: ya está el de creación', async () => {
      const { query } = await run({ media: [{ format: MultimediaFormat.IMG, url: 'a.jpg' }], withCtx: false });
      expect(query).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deja constancia de la eliminación antes de dar de baja la propiedad', async () => {
      const order: string[] = [];
      const query = jest.fn(async () => { order.push('history'); });
      const service = makeService({
        propertyRepository: { manager: { query } },
        softDeletePropertyUseCase: { execute: jest.fn(async () => { order.push('softDelete'); }) },
      });

      await service.remove('p1', 'u1', ctx);

      expect(order).toEqual(['history', 'softDelete']);
      expect(appended(query as unknown as jest.Mock)[0]).toMatchObject({
        field: 'deletion',
        kind: 'DELETED',
        newValue: 'Eliminada',
        changedBy: 'u1',
        source: { channel: 'BACKOFFICE' },
      });
    });
  });

  describe('getPropertyHistory · valores legibles', () => {
    const makeHistoryService = (history: any[]) => {
      const users = [
        { id: 'agent-1', name: 'Carlos Navarro', email: 'c@x.cl', personId: null },
        { id: 'admin-1', name: 'Administrador Sistema', email: 'a@x.cl', personId: null, personalInfo: { firstName: 'Administrador', lastName: 'Sistema' } },
      ];
      const qb = (rows: any[]) => ({
        withDeleted: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(rows),
      });
      return makeService({
        propertyRepository: { findOne: jest.fn().mockResolvedValue({ id: 'p1', changeHistory: history }) },
        userRepository: { createQueryBuilder: jest.fn(() => qb(users)) },
        propertyTypeRepository: { find: jest.fn().mockResolvedValue([{ id: 'type-1', name: 'Casa' }]) },
      });
    };

    it('agrega el nombre del agente y del tipo de propiedad, y conserva origen y agrupación', async () => {
      const service = makeHistoryService([
        {
          field: 'assignedAgentId', previousValue: null, newValue: 'agent-1', changedBy: 'admin-1',
          kind: 'UPDATED', source: { channel: 'BACKOFFICE', section: 'Información básica' }, groupId: 'g1',
        },
        { field: 'propertyTypeId', previousValue: 'type-1', newValue: 'type-borrado', changedBy: 'admin-1' },
        { field: 'title', previousValue: 'A', newValue: 'B', changedBy: 'admin-1' },
      ]);

      const out = await service.getPropertyHistory('p1');

      expect(out[0]).toMatchObject({ previousDisplay: undefined, newDisplay: 'Carlos Navarro', groupId: 'g1', source: { section: 'Información básica' } });
      expect(out[1]).toMatchObject({ previousDisplay: 'Casa', newDisplay: 'No disponible' });
      expect(out[2]).not.toHaveProperty('newDisplay');
      expect(out[0].changedBy).toBe('Administrador Sistema');
    });

    it('sin campos con id no hace consultas extra', async () => {
      const service = makeHistoryService([{ field: 'title', previousValue: 'A', newValue: 'B', changedBy: 'admin-1' }]);
      await service.getPropertyHistory('p1');
      expect(service.propertyTypeRepository.find).not.toHaveBeenCalled();
    });
  });
});

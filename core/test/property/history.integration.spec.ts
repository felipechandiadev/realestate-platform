/**
 * Historial de propiedades contra MySQL real (BD local de pruebas): agregado atómico
 * al JSON, escrituras simultáneas y el flujo completo de eventos por el servicio.
 */
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import entities from '../../src/config/entities';
import { Property } from '../../src/modules/property/domain/property.entity';
import { PropertyOperationType } from '../../src/shared/enums/property-operation-type.enum';
import { UpdatePropertyUseCase } from '../../src/modules/property/application/use-cases/update-property.usecase';
import { TypeormPropertyRepository } from '../../src/modules/property/infrastructure/typeorm-property.repository';
import {
  appendPropertyHistory,
  eventEntry,
} from '../../src/modules/property/application/property-history';

jest.setTimeout(120000);

describe('Historial de propiedades (integración MySQL)', () => {
  let ds: DataSource;
  let properties: Repository<Property>;
  let updateUseCase: UpdatePropertyUseCase;
  const ctx = { userId: 'u1', channel: 'BACKOFFICE' as const };

  const newProperty = async (extra: Partial<Property> = {}) =>
    properties.save(
      properties.create({
        title: 'Propiedad de historial',
        code: `H-${randomUUID().slice(0, 8)}`,
        operationType: PropertyOperationType.SALE,
        ...extra,
      } as Property),
    );

  const history = async (id: string): Promise<any[]> => {
    const [row] = await ds.query('SELECT changeHistory AS h FROM properties WHERE id = ?', [id]);
    if (row.h == null) return [];
    return typeof row.h === 'string' ? JSON.parse(row.h) : row.h;
  };

  beforeAll(async () => {
    ds = new DataSource({
      type: 'mysql',
      connectorPackage: 'mysql2',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: entities as any,
      synchronize: true,
    });
    await ds.initialize();
    properties = ds.getRepository(Property);
    updateUseCase = new UpdatePropertyUseCase(
      new TypeormPropertyRepository(properties as any),
      { notifyAgentAssigned: jest.fn(), notifyPropertyStatusChange: jest.fn() } as any,
    );
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  it('agrega a una columna vacía y conserva lo que ya había, en orden', async () => {
    const p = await newProperty();
    expect(await history(p.id)).toEqual([]);

    await appendPropertyHistory(ds.manager, p.id, [eventEntry({ field: 'a', kind: 'UPDATED', newValue: 1 }, ctx)]);
    await appendPropertyHistory(ds.manager, p.id, [
      eventEntry({ field: 'b', kind: 'UPDATED', newValue: 2 }, ctx),
      eventEntry({ field: 'c', kind: 'UPDATED', newValue: 3 }, ctx),
    ]);

    const h = await history(p.id);
    expect(h.map((e) => e.field)).toEqual(['a', 'b', 'c']);
    expect(h[0]).toMatchObject({ kind: 'UPDATED', changedBy: 'u1', source: { channel: 'BACKOFFICE' }, previousValue: null, newValue: 1 });
  });

  it('30 eventos simultáneos se guardan todos (sin pisarse)', async () => {
    const p = await newProperty();
    await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        appendPropertyHistory(ds.manager, p.id, [eventEntry({ field: `f${i}`, kind: 'UPDATED' }, ctx)]),
      ),
    );
    const h = await history(p.id);
    expect(h).toHaveLength(30);
    expect(new Set(h.map((e) => e.field)).size).toBe(30);
  });

  it('un evento agregado mientras se edita no se pierde (y la edición no borra los anteriores)', async () => {
    const p = await newProperty({ address: null } as any);
    await appendPropertyHistory(ds.manager, p.id, [eventEntry({ field: 'multimedia', kind: 'MEDIA', newValue: 'Se agregó 1 imagen' }, ctx)]);

    await updateUseCase.execute(p.id, { address: 'Calle 1', latitude: -33.5, longitude: -70.7 } as any, 'u1', ctx);

    const h = await history(p.id);
    expect(h.map((e) => e.field)).toEqual(['multimedia', 'address', 'latitude', 'longitude']);
    const edit = h.slice(1);
    expect(new Set(edit.map((e) => e.groupId)).size).toBe(1);
    expect(edit.every((e) => e.source?.section === 'Ubicación')).toBe(true);
  });

  it('una edición repetida con los mismos valores (incl. decimales y listas) no agrega entradas', async () => {
    const p = await newProperty({ price: 150000000 as any, otherFeatures: ['POOL'] } as any);
    await updateUseCase.execute(p.id, { price: 150000000, otherFeatures: ['POOL'], title: 'Propiedad de historial' } as any, 'u1', ctx);
    await updateUseCase.execute(p.id, { price: 150000000, otherFeatures: ['POOL'] } as any, 'u1', ctx);
    expect(await history(p.id)).toEqual([]);
  });
});

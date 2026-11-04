/**
 * Tipos de propiedad contra MySQL real (BD local de pruebas): índice único del nombre,
 * borrado lógico, regla de eliminación, búsqueda con LIKE y creaciones simultáneas.
 */
import { randomUUID } from 'crypto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import entities from '../../src/config/entities';
import { Property } from '../../src/modules/property/domain/property.entity';
import { PropertyType } from '../../src/modules/property-types/domain/property-type.entity';
import { PropertyOperationType } from '../../src/shared/enums/property-operation-type.enum';
import { TypeormPropertyTypeRepository } from '../../src/modules/property-types/infrastructure/typeorm-property-type.repository';
import { CreatePropertyTypeUseCase } from '../../src/modules/property-types/application/use-cases/create-property-type.usecase';
import { UpdatePropertyTypeUseCase } from '../../src/modules/property-types/application/use-cases/update-property-type.usecase';
import { SoftDeletePropertyTypeUseCase } from '../../src/modules/property-types/application/use-cases/soft-delete-property-type.usecase';
import { FindAllPropertyTypesUseCase } from '../../src/modules/property-types/application/use-cases/find-all-property-types.usecase';
import { PropertyTypesService } from '../../src/modules/property-types/application/property-types.service';

jest.setTimeout(120000);

describe('Tipos de propiedad (integración MySQL)', () => {
  let ds: DataSource;
  let types: Repository<PropertyType>;
  let properties: Repository<Property>;
  let create: CreatePropertyTypeUseCase;
  let update: UpdatePropertyTypeUseCase;
  let remove: SoftDeletePropertyTypeUseCase;
  let findAll: FindAllPropertyTypesUseCase;
  let service: PropertyTypesService;

  /** Sufijo único por ejecución: no choca con datos de otras pruebas. */
  const run = randomUUID().slice(0, 6);
  const n = (label: string) => `${label} ${run}`;

  const newProperty = (propertyTypeId: string, extra: Partial<Property> = {}) =>
    properties.save(
      properties.create({
        title: 'Propiedad de prueba',
        code: `PT-${randomUUID().slice(0, 8)}`,
        operationType: PropertyOperationType.SALE,
        propertyTypeId,
        ...extra,
      } as Property),
    );

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
    types = ds.getRepository(PropertyType);
    properties = ds.getRepository(Property);

    const repo = new TypeormPropertyTypeRepository(types);
    create = new CreatePropertyTypeUseCase(repo);
    update = new UpdatePropertyTypeUseCase(repo);
    remove = new SoftDeletePropertyTypeUseCase(repo);
    findAll = new FindAllPropertyTypesUseCase(repo);
    service = new PropertyTypesService(
      create, findAll, {} as any, {} as any, {} as any, update, remove, {} as any,
    );
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  it('crea con el nombre recortado y el índice único no distingue mayúsculas', async () => {
    const a = await create.execute({ name: `  ${n('Casa')}  `, description: ' una casa ', hasBedrooms: true } as any);
    expect(a).toMatchObject({ name: n('Casa'), description: 'una casa', hasBedrooms: true, hasFloors: false });

    await expect(create.execute({ name: n('Casa').toUpperCase() } as any)).rejects.toThrow(/ya existe/);
    await expect(create.execute({ name: `  ${n('casa')}` } as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('un tipo eliminado libera su nombre: se puede volver a crear (antes daba "Duplicate entry")', async () => {
    const a = await create.execute({ name: n('Bodega') } as any);
    await remove.execute(a.id);

    const again = await create.execute({ name: n('Bodega') } as any);
    expect(again.id).not.toBe(a.id);

    const [old] = await ds.query('SELECT name, deletedAt FROM property_types WHERE id = ?', [a.id]);
    expect(old.deletedAt).not.toBeNull();
    expect(old.name).not.toBe(n('Bodega'));
    expect(old.name).toMatch(/\[eliminado \d{4}-\d{2}-\d{2} [0-9a-f]{8}\]$/);
    expect((await findAll.execute(n('Bodega'))).map((t) => t.id)).toEqual([again.id]);
  });

  it('un eliminado antiguo que sigue con su nombre (sin renombrar) también se libera al crear o renombrar', async () => {
    const legacy = await create.execute({ name: n('Local') } as any);
    await types.softDelete(legacy.id); // como se borraba antes: el nombre queda reservado
    await expect(create.execute({ name: n('Local') } as any)).resolves.toMatchObject({ name: n('Local') });

    const legacy2 = await create.execute({ name: n('Oficina vieja') } as any);
    await types.softDelete(legacy2.id);
    const other = await create.execute({ name: n('Oficina nueva') } as any);
    await expect(update.execute(other.id, { name: n('Oficina vieja') })).resolves.toMatchObject({ name: n('Oficina vieja') });
  });

  it('renombrar: a uno existente falla con mensaje claro; cambiar solo las mayúsculas es válido', async () => {
    const a = await create.execute({ name: n('Terreno') } as any);
    const b = await create.execute({ name: n('Parcela') } as any);

    const err: any = await update.execute(b.id, { name: n('terreno') }).catch((e) => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect(err.message).toBe('El nombre del tipo de propiedad ya existe');

    await expect(update.execute(a.id, { name: n('TERRENO') })).resolves.toMatchObject({ name: n('TERRENO') });
  });

  it('descripción: vacía la borra y sin enviarla se conserva', async () => {
    const a = await create.execute({ name: n('Depto'), description: 'texto' } as any);
    await update.execute(a.id, { name: n('Depto 2') });
    expect((await types.findOneByOrFail({ id: a.id })).description).toBe('texto');
    await update.execute(a.id, { description: '  ' });
    expect((await types.findOneByOrFail({ id: a.id })).description).toBeNull();
  });

  it('no se puede eliminar un tipo que usan propiedades activas (las eliminadas no cuentan)', async () => {
    const t = await create.execute({ name: n('Casa en uso') } as any);
    const p1 = await newProperty(t.id);
    await newProperty(t.id);
    const gone = await newProperty(t.id);
    await properties.softDelete(gone.id);

    const err: any = await remove.execute(t.id).catch((e) => e);
    expect(err).toBeInstanceOf(ConflictException);
    expect(err.message).toMatch(/2 propiedades lo usan/);
    expect((await types.findOneByOrFail({ id: t.id })).deletedAt).toBeNull();

    // al cambiarles el tipo (o eliminarlas) ya se puede
    await properties.softDelete(p1.id);
    await expect(remove.execute(t.id)).rejects.toThrow(/1 propiedad lo usa/);
    await properties.softDelete({ propertyTypeId: t.id } as any);
    await expect(remove.execute(t.id)).resolves.toBeUndefined();
  });

  it('eliminar un id inexistente o ya eliminado es 404', async () => {
    const t = await create.execute({ name: n('Efímero') } as any);
    await remove.execute(t.id);
    await expect(remove.execute(t.id)).rejects.toBeInstanceOf(NotFoundException);
    await expect(remove.execute(randomUUID())).rejects.toBeInstanceOf(NotFoundException);
  });

  it('la búsqueda trata % y _ como texto (LIKE real)', async () => {
    await create.execute({ name: n('100% terreno') } as any);
    await create.execute({ name: n('Local_1') } as any);
    await create.execute({ name: n('LocalX1') } as any);

    const found = async (q: string) => (await findAll.execute(q)).map((t) => t.name).filter((x) => x.endsWith(run));
    expect(await found(`% terreno`)).toEqual([n('100% terreno')]);
    expect(await found(`l_1`)).toEqual([n('Local_1')]);
    // Sin comodines, 'local' encuentra los dos (y el 'Local' de otra prueba, que también lo contiene).
    expect(await found('local')).toEqual(expect.arrayContaining([n('Local_1'), n('LocalX1')]));
  });

  it('10 creaciones simultáneas del mismo nombre: una gana y el resto recibe "ya existe"', async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () => service.create({ name: n('Carrera') } as any)),
    );
    const ok = results.filter((r) => r.status === 'fulfilled');
    const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    expect(ok).toHaveLength(1);
    expect(failed).toHaveLength(9);
    for (const f of failed) {
      expect(f.reason).toBeInstanceOf(ConflictException);
      expect(f.reason.message).toBe('El nombre del tipo de propiedad ya existe');
    }
    expect(await types.countBy({ name: n('Carrera') })).toBe(1);
  });

  it('nombre de 255 caracteres cabe; el renombrado al eliminar no se pasa de 255', async () => {
    const long = ('x'.repeat(250) + run).slice(0, 255);
    const t = await create.execute({ name: long } as any);
    await remove.execute(t.id);
    const [row] = await ds.query('SELECT name FROM property_types WHERE id = ?', [t.id]);
    expect(row.name.length).toBeLessThanOrEqual(255);
    await expect(create.execute({ name: long } as any)).resolves.toMatchObject({ name: long });
  });
});

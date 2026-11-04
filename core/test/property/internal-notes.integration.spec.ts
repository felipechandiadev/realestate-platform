/**
 * Notas internas contra MySQL real (la BD local de pruebas, ver load-test-env.ts):
 * guardado en la columna JSON, escrituras simultáneas, borrado con permisos y la
 * migración 1792200000000 (subir, bajar e idempotencia).
 */
import { randomUUID } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import entities from '../../src/config/entities';
import { Property } from '../../src/modules/property/domain/property.entity';
import { User, UserRole } from '../../src/modules/users/domain/user.entity';
import { PropertyOperationType } from '../../src/shared/enums/property-operation-type.enum';
import { PropertyService } from '../../src/modules/property/application/property.service';
import { InternalNote } from '../../src/modules/property/domain/internal-note';
import { AddPropertyInternalNotesLog1792200000000 } from '../../src/database/migrations/1792200000000-AddPropertyInternalNotesLog';

jest.setTimeout(120000);

describe('Notas internas (integración MySQL)', () => {
  let ds: DataSource;
  let properties: Repository<Property>;
  let users: Repository<User>;
  let service: PropertyService;
  let ana: User;
  let luis: User;

  const newProperty = async (extra: Partial<Property> = {}) =>
    properties.save(
      properties.create({
        title: 'Propiedad de prueba',
        code: `T-${randomUUID().slice(0, 8)}`,
        operationType: PropertyOperationType.SALE,
        ...extra,
      } as Property),
    );

  const rawLog = async (id: string): Promise<InternalNote[] | null> => {
    const [row] = await ds.query('SELECT internalNotesLog AS log FROM properties WHERE id = ?', [id]);
    if (row.log == null) return null;
    return typeof row.log === 'string' ? JSON.parse(row.log) : row.log;
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
    users = ds.getRepository(User);

    const mkUser = (name: string, role: UserRole) =>
      users.save(
        users.create({
          username: `${name}-${randomUUID().slice(0, 6)}`,
          email: `${name}-${randomUUID().slice(0, 6)}@test.cl`,
          password: 'x',
          role,
          personalInfo: { firstName: name, lastName: 'Prueba' },
        } as any) as unknown as User,
      ) as Promise<User>;
    ana = await mkUser('Ana', UserRole.AGENT);
    luis = await mkUser('Luis', UserRole.AGENT);

    service = Object.create(PropertyService.prototype) as PropertyService;
    Object.assign(service, {
      propertyRepository: {
        manager: ds.manager,
        findOne: (o: any) => properties.findOne(o),
      },
      userRepository: users,
    });
  });

  afterAll(async () => {
    await ds?.destroy();
  });

  it('la columna es JSON y guarda las notas con autor y fecha', async () => {
    const [col] = await ds.query("SHOW COLUMNS FROM properties LIKE 'internalNotesLog'");
    expect(String(col.Type).toLowerCase()).toBe('json');

    const p = await newProperty();
    const note = await service.addInternalNote(p.id, '  Llamar al dueño el lunes  ', { id: ana.id });

    expect(note).toMatchObject({ text: 'Llamar al dueño el lunes', authorId: ana.id, authorName: 'Ana Prueba' });
    const stored = await rawLog(p.id);
    expect(stored).toEqual([note]);
    await expect(service.listInternalNotes(p.id)).resolves.toEqual([note]);
  });

  it('va acumulando notas en orden, sin perder las anteriores', async () => {
    const p = await newProperty();
    await service.addInternalNote(p.id, 'Primera', { id: ana.id });
    await service.addInternalNote(p.id, 'Segunda', { id: luis.id });
    await service.addInternalNote(p.id, 'Tercera', { id: ana.id });

    const list = await service.listInternalNotes(p.id);
    expect(list.map((n) => n.text)).toEqual(['Primera', 'Segunda', 'Tercera']);
    expect(list.map((n) => n.authorName)).toEqual(['Ana Prueba', 'Luis Prueba', 'Ana Prueba']);
  });

  it('20 notas agregadas al mismo tiempo se guardan todas (sin pisarse)', async () => {
    const p = await newProperty();
    await Promise.all(
      Array.from({ length: 20 }, (_, i) =>
        service.addInternalNote(p.id, `Nota ${i}`, { id: i % 2 ? ana.id : luis.id }),
      ),
    );
    const list = await service.listInternalNotes(p.id);
    expect(list).toHaveLength(20);
    expect(new Set(list.map((n) => n.text)).size).toBe(20);
    expect(new Set(list.map((n) => n.id)).size).toBe(20);
  });

  it('borrar: el autor sí, otro agente no, un admin sí; sin notas queda null', async () => {
    const p = await newProperty();
    const mine = await service.addInternalNote(p.id, 'De Ana', { id: ana.id });
    const other = await service.addInternalNote(p.id, 'De Luis', { id: luis.id });

    await expect(
      service.deleteInternalNote(p.id, other.id, { id: ana.id, role: 'AGENT' }),
    ).rejects.toThrow(/autor o un administrador/);
    expect(await service.listInternalNotes(p.id)).toHaveLength(2);

    await service.deleteInternalNote(p.id, mine.id, { id: ana.id, role: 'AGENT' });
    expect((await service.listInternalNotes(p.id)).map((n) => n.id)).toEqual([other.id]);

    await service.deleteInternalNote(p.id, other.id, { id: 'cualquiera', role: 'ADMIN' });
    expect(await rawLog(p.id)).toBeNull();
    await expect(service.listInternalNotes(p.id)).resolves.toEqual([]);
  });

  it('propiedad eliminada (soft delete) o inexistente -> 404', async () => {
    const p = await newProperty();
    await properties.softDelete(p.id);
    await expect(service.addInternalNote(p.id, 'x', { id: ana.id })).rejects.toThrow(/no encontrada/);
    await expect(service.listInternalNotes(randomUUID())).rejects.toThrow(/no encontrada/);
  });

  describe('migración 1792200000000', () => {
    const migration = new AddPropertyInternalNotesLog1792200000000();

    it('sube (copia el texto antiguo como primera nota), es idempotente y baja sin perder notas', async () => {
      const withText = await newProperty({ internalNotes: '  Pendiente de antecedentes  ' } as any);
      const withBlank = await newProperty({ internalNotes: '   ' } as any);
      const without = await newProperty();

      const qr = ds.createQueryRunner();
      try {
        // Estado "antes": sin la columna nueva (como en una base sin migrar).
        await qr.query('ALTER TABLE `properties` DROP COLUMN `internalNotesLog`');
        expect(await qr.hasColumn('properties', 'internalNotesLog')).toBe(false);

        await migration.up(qr);
        expect(await qr.hasColumn('properties', 'internalNotesLog')).toBe(true);

        const migrated = await rawLog(withText.id);
        expect(migrated).toHaveLength(1);
        expect(migrated![0]).toMatchObject({
          text: 'Pendiente de antecedentes',
          authorId: null,
          authorName: 'Nota anterior',
        });
        expect(migrated![0].id).toEqual(expect.any(String));
        expect(new Date(migrated![0].createdAt).toString()).not.toBe('Invalid Date');
        expect(await rawLog(withBlank.id)).toBeNull();
        expect(await rawLog(without.id)).toBeNull();
        // El texto antiguo no se toca (respaldo).
        const [legacy] = await ds.query('SELECT internalNotes FROM properties WHERE id = ?', [withText.id]);
        expect(legacy.internalNotes).toBe('  Pendiente de antecedentes  ');

        // Idempotente: otra pasada no duplica ni cambia nada.
        await migration.up(qr);
        expect(await rawLog(withText.id)).toEqual(migrated);

        // Una nota nueva agregada después de migrar...
        await service.addInternalNote(withText.id, 'Segunda nota', { id: ana.id });
        // ...baja a texto con todas las notas.
        await migration.down(qr);
        expect(await qr.hasColumn('properties', 'internalNotesLog')).toBe(false);
        const [down] = await ds.query('SELECT internalNotes FROM properties WHERE id = ?', [withText.id]);
        expect(down.internalNotes).toBe('Pendiente de antecedentes\n\nSegunda nota');
      } finally {
        // Deja la columna como la espera la entidad para el resto de las pruebas.
        if (!(await qr.hasColumn('properties', 'internalNotesLog'))) await migration.up(qr);
        await qr.release();
      }
    });
  });
});

/**
 * API de tipos de propiedad de punta a punta (HTTP real + MySQL de pruebas): validaciones,
 * conflictos, roles (admin / agente / comunidad / anónimo), endpoints públicos y la regla de
 * eliminación. Crea sus propios usuarios, así que no depende del seed.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { AppModule } from '../../src/app.module';
import { User, UserRole, UserStatus } from '../../src/modules/users/domain/user.entity';
import { Property } from '../../src/modules/property/domain/property.entity';
import { PropertyOperationType } from '../../src/shared/enums/property-operation-type.enum';

jest.setTimeout(120000);

describe('PropertyTypeController (integración HTTP)', () => {
  let app: INestApplication;
  let ds: DataSource;
  let admin: string;
  let agent: string;
  let community: string;
  const http = () => request(app.getHttpServer());
  const as = (token: string) => ({ Authorization: `Bearer ${token}` });

  const run = randomUUID().slice(0, 6);
  const PASSWORD = 'Prueba1234';

  const createUser = async (name: string, role: UserRole) => {
    const email = `${name}-${run}@test.cl`;
    await ds.getRepository(User).save(
      ds.getRepository(User).create({
        username: `${name}-${run}`,
        email,
        password: await bcrypt.hash(PASSWORD, 4),
        role,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        personalInfo: { firstName: name, lastName: 'Prueba' },
      } as any) as unknown as User,
    );
    return email;
  };

  const login = async (path: string, email: string): Promise<string> => {
    const res = await http().post(path).send({ email, password: PASSWORD });
    const token = res.body?.access_token || res.body?.accessToken || res.body?.token;
    if (res.status >= 400 || !token) throw new Error(`login falló (${path}): ${res.status} ${JSON.stringify(res.body)}`);
    return token;
  };

  const newType = async (body: Record<string, unknown>, token = admin) =>
    (await http().post('/property-types').set(as(token)).send(body).expect(201)).body;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    ds = moduleFixture.get<DataSource>(DataSource);

    admin = await login('/auth/staff/sign-in', await createUser('admin', UserRole.ADMIN));
    agent = await login('/auth/staff/sign-in', await createUser('agente', UserRole.AGENT));
    community = await login('/auth/community/sign-in', await createUser('cliente', UserRole.COMMUNITY));
  });

  beforeEach(async () => {
    await ds.query('SET FOREIGN_KEY_CHECKS = 0');
    await ds.query('TRUNCATE TABLE properties');
    await ds.query('TRUNCATE TABLE property_types');
    await ds.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /property-types', () => {
    it('crea un tipo: recorta el nombre, guarda las características y deja la descripción vacía en null', async () => {
      const res = await http()
        .post('/property-types')
        .set(as(admin))
        .send({ name: '  Casa  ', description: '   ', hasBedrooms: true, hasBathrooms: true })
        .expect(201);
      expect(res.body).toMatchObject({
        name: 'Casa',
        description: null,
        hasBedrooms: true,
        hasBathrooms: true,
        hasFloors: false,
      });
      expect(res.body.id).toEqual(expect.any(String));
    });

    it('un agente también puede crear tipos', async () => {
      await http().post('/property-types').set(as(agent)).send({ name: 'Depto' }).expect(201);
    });

    it.each([
      ['sin nombre', {}],
      ['nombre vacío', { name: '' }],
      ['nombre de solo espacios', { name: '    ' }],
      ['nombre que no es texto', { name: 123 }],
      ['nombre de 256 caracteres', { name: 'x'.repeat(256) }],
      ['descripción demasiado larga', { name: 'A', description: 'x'.repeat(2001) }],
      ['característica que no es booleana', { name: 'A', hasBedrooms: 'si' }],
    ])('rechaza con 400: %s', async (_label, body) => {
      const res = await http().post('/property-types').set(as(admin)).send(body).expect(400);
      expect(Array.isArray(res.body.message)).toBe(true);
      expect(await ds.query('SELECT COUNT(*) c FROM property_types')).toEqual([{ c: '0' }]);
    });

    it('un nombre de 255 caracteres cabe', async () => {
      await newType({ name: 'x'.repeat(255) });
    });

    it('descarta campos que no son del tipo (id, fechas, borrado)', async () => {
      const forcedId = randomUUID();
      const res = await http()
        .post('/property-types')
        .set(as(admin))
        .send({ name: 'A', id: forcedId, deletedAt: '2020-01-01T00:00:00Z', createdAt: '2000-01-01T00:00:00Z' })
        .expect(201);
      expect(res.body.id).not.toBe(forcedId);
      const [row] = await ds.query('SELECT deletedAt, createdAt FROM property_types WHERE id = ?', [res.body.id]);
      expect(row.deletedAt).toBeNull();
      expect(new Date(row.createdAt).getFullYear()).toBeGreaterThan(2020);
    });

    it('409 con mensaje claro si el nombre ya existe, sin distinguir mayúsculas ni espacios', async () => {
      await newType({ name: 'Casa' });
      for (const name of ['Casa', 'casa', '  CASA  ']) {
        const res = await http().post('/property-types').set(as(admin)).send({ name }).expect(409);
        expect(res.body.message).toBe('El nombre del tipo de propiedad ya existe');
      }
    });

    it('un nombre ya usado por un tipo eliminado se puede volver a crear', async () => {
      const a = await newType({ name: 'Bodega' });
      await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(200);
      const again = await newType({ name: 'Bodega' });
      expect(again.id).not.toBe(a.id);
    });

    it('401 sin sesión y 403 para la comunidad', async () => {
      await http().post('/property-types').send({ name: 'X' }).expect(401);
      await http().post('/property-types').set(as(community)).send({ name: 'X' }).expect(403);
    });
  });

  describe('GET', () => {
    it('lista del más reciente al más antiguo y sin eliminados (admin y agente)', async () => {
      await newType({ name: 'Casa' });
      await newType({ name: 'Depto' });
      const gone = await newType({ name: 'Viejo' });
      await http().delete(`/property-types/${gone.id}`).set(as(admin)).expect(200);

      for (const token of [admin, agent]) {
        const res = await http().get('/property-types').set(as(token)).expect(200);
        expect(res.body.map((t: any) => t.name)).toEqual(['Depto', 'Casa']);
      }
    });

    it('busca por parte del nombre y trata % y _ como texto', async () => {
      await newType({ name: 'Casa de campo' });
      await newType({ name: '100% terreno' });
      await newType({ name: 'Local_1' });
      await newType({ name: 'LocalX1' });
      const names = async (q: string) =>
        (await http().get('/property-types').query({ search: q }).set(as(admin)).expect(200)).body.map((t: any) => t.name);

      expect(await names('  CAMPO ')).toEqual(['Casa de campo']);
      expect(await names('%')).toEqual(['100% terreno']);
      expect(await names('_')).toEqual(['Local_1']);
      expect(await names('zzz')).toEqual([]);
    });

    it('la lista exige sesión de staff (401 anónimo, 403 comunidad)', async () => {
      await http().get('/property-types').expect(401);
      await http().get('/property-types').set(as(community)).expect(403);
      await http().get('/property-types/minimal').expect(401);
    });

    it('minimal devuelve solo id y nombre', async () => {
      await newType({ name: 'Casa', description: 'x', hasBedrooms: true });
      const res = await http().get('/property-types/minimal').set(as(admin)).expect(200);
      expect(Object.keys(res.body[0]).sort()).toEqual(['id', 'name']);
    });

    it('los endpoints públicos responden sin sesión', async () => {
      const a = await newType({ name: 'Casa', hasBedrooms: true, hasParkingSpaces: true });
      const list = await http().get('/property-types/public/list').expect(200);
      expect(list.body.map((t: any) => t.name)).toEqual(['Casa']);
      const features = await http().get('/property-types/features').expect(200);
      expect(Object.keys(features.body[0]).sort()).toEqual(['hasBathrooms', 'hasBedrooms', 'hasParkingSpaces', 'id', 'name']);
      expect(features.body[0]).toMatchObject({ hasBedrooms: true, hasParkingSpaces: true, hasBathrooms: false });
      const one = await http().get(`/property-types/${a.id}`).expect(200);
      expect(one.body.name).toBe('Casa');
      await http().get(`/property-types/public/${a.id}`).expect(200);
    });

    it('404 para un id inexistente, mal formado o eliminado', async () => {
      const a = await newType({ name: 'Casa' });
      await http().get(`/property-types/${randomUUID()}`).expect(404);
      await http().get('/property-types/abc').expect(404);
      await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(200);
      await http().get(`/property-types/${a.id}`).expect(404);
    });
  });

  describe('PATCH /property-types/:id', () => {
    it('cambia nombre y descripción, y vaciar la descripción la borra', async () => {
      const a = await newType({ name: 'Casa', description: 'vieja' });
      const res = await http().patch(`/property-types/${a.id}`).set(as(admin)).send({ name: '  Casa grande ', description: ' nueva ' }).expect(200);
      expect(res.body).toMatchObject({ name: 'Casa grande', description: 'nueva' });
      const cleared = await http().patch(`/property-types/${a.id}`).set(as(admin)).send({ description: '   ' }).expect(200);
      expect(cleared.body.description).toBeNull();
      expect(cleared.body.name).toBe('Casa grande');
    });

    it('409 al renombrar a uno existente; cambiar solo las mayúsculas es válido', async () => {
      const a = await newType({ name: 'Casa' });
      const b = await newType({ name: 'Depto' });
      const res = await http().patch(`/property-types/${b.id}`).set(as(admin)).send({ name: 'casa' }).expect(409);
      expect(res.body.message).toBe('El nombre del tipo de propiedad ya existe');
      await http().patch(`/property-types/${a.id}`).set(as(admin)).send({ name: 'CASA' }).expect(200);
    });

    it.each([
      ['nombre vacío', { name: '' }],
      ['nombre de espacios', { name: '   ' }],
      ['nombre de 256 caracteres', { name: 'x'.repeat(256) }],
      ['característica inválida', { hasFloors: 'x' }],
    ])('400: %s (y no se modifica nada)', async (_l, body) => {
      const a = await newType({ name: 'Casa' });
      await http().patch(`/property-types/${a.id}`).set(as(admin)).send(body).expect(400);
      expect((await ds.query('SELECT name FROM property_types WHERE id = ?', [a.id]))[0].name).toBe('Casa');
    });

    it('no deja cambiar el id ni revivir un tipo eliminado', async () => {
      const a = await newType({ name: 'Casa' });
      const res = await http().patch(`/property-types/${a.id}`).set(as(admin)).send({ id: randomUUID(), deletedAt: null, name: 'Casa 2' }).expect(200);
      expect(res.body.id).toBe(a.id);
      await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(200);
      await http().patch(`/property-types/${a.id}`).set(as(admin)).send({ name: 'Otra vez' }).expect(404);
    });

    it('404 si no existe; 401 anónimo; 403 comunidad', async () => {
      const a = await newType({ name: 'Casa' });
      await http().patch(`/property-types/${randomUUID()}`).set(as(admin)).send({ name: 'X' }).expect(404);
      await http().patch(`/property-types/${a.id}`).send({ name: 'X' }).expect(401);
      await http().patch(`/property-types/${a.id}`).set(as(community)).send({ name: 'X' }).expect(403);
    });

    it('PATCH /:id/features activa y desactiva solo lo enviado y valida el tipo de dato', async () => {
      const a = await newType({ name: 'Casa', hasBedrooms: true });
      const res = await http().patch(`/property-types/${a.id}/features`).set(as(admin)).send({ hasBedrooms: false, hasFloors: true }).expect(200);
      expect(res.body).toMatchObject({ name: 'Casa', hasBedrooms: false, hasFloors: true, hasBathrooms: false });
      await http().patch(`/property-types/${a.id}/features`).set(as(admin)).send({ hasFloors: 'x' }).expect(400);
      await http().patch(`/property-types/${randomUUID()}/features`).set(as(admin)).send({ hasFloors: true }).expect(404);
      // por esta vía no se cambia el nombre
      const sneaky = await http().patch(`/property-types/${a.id}/features`).set(as(admin)).send({ name: 'Hack', hasFloors: false }).expect(200);
      expect(sneaky.body.name).toBe('Casa');
    });
  });

  describe('DELETE /property-types/:id', () => {
    const newProperty = (propertyTypeId: string) =>
      ds.getRepository(Property).save(
        ds.getRepository(Property).create({
          title: 'Propiedad de prueba',
          code: `PT-${randomUUID().slice(0, 8)}`,
          operationType: PropertyOperationType.SALE,
          propertyTypeId,
        } as Property),
      );

    it('elimina un tipo sin propiedades: deja de aparecer en la lista y en los públicos', async () => {
      const a = await newType({ name: 'Casa' });
      await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(200);
      expect((await http().get('/property-types').set(as(admin)).expect(200)).body).toEqual([]);
      expect((await http().get('/property-types/public/list').expect(200)).body).toEqual([]);
      expect((await http().get('/property-types/features').expect(200)).body).toEqual([]);
    });

    it('409 si hay propiedades que lo usan, diciendo cuántas; las eliminadas no cuentan', async () => {
      const a = await newType({ name: 'Casa' });
      await newProperty(a.id);
      const removed = await newProperty(a.id);
      await ds.getRepository(Property).softDelete(removed.id);

      const res = await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(409);
      expect(res.body.message).toBe('No se puede eliminar "Casa": 1 propiedad lo usa. Cámbiale el tipo antes de eliminarlo.');
      await http().get(`/property-types/${a.id}`).expect(200); // sigue activo
    });

    it('404 si no existe o ya estaba eliminado', async () => {
      const a = await newType({ name: 'Casa' });
      await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(200);
      await http().delete(`/property-types/${a.id}`).set(as(admin)).expect(404);
      await http().delete(`/property-types/${randomUUID()}`).set(as(admin)).expect(404);
    });

    it('un agente puede eliminar; anónimo 401 y comunidad 403', async () => {
      const a = await newType({ name: 'Casa' });
      await http().delete(`/property-types/${a.id}`).expect(401);
      await http().delete(`/property-types/${a.id}`).set(as(community)).expect(403);
      await http().delete(`/property-types/${a.id}`).set(as(agent)).expect(200);
    });
  });
});

import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { FindOperator } from 'typeorm';
import { PropertyType } from '../domain/property-type.entity';
import { PropertyTypeRepository } from '../domain/property-type.repository';
import {
  CreatePropertyTypeDto,
  UpdatePropertyTypeDto,
  UpdatePropertyTypeFeaturesDto,
} from '../dto/property-type.dto';
import { CreatePropertyTypeUseCase } from './use-cases/create-property-type.usecase';
import { FindAllPropertyTypesUseCase } from './use-cases/find-all-property-types.usecase';
import { FindPropertyTypeUseCase } from './use-cases/find-property-type.usecase';
import { SoftDeletePropertyTypeUseCase } from './use-cases/soft-delete-property-type.usecase';
import { UpdatePropertyTypeFeaturesUseCase } from './use-cases/update-property-type-features.usecase';
import { UpdatePropertyTypeUseCase } from './use-cases/update-property-type.usecase';
import { PropertyTypesService } from './property-types.service';

/**
 * Repositorio en memoria que imita lo que importa de MySQL: borrado lógico (find no ve los
 * eliminados salvo `withDeleted`) y nombre ÚNICO sin distinguir mayúsculas, incluso entre
 * eliminados (por eso un tipo eliminado "reserva" su nombre en la base real).
 */
class FakeRepo extends PropertyTypeRepository {
  rows: PropertyType[] = [];
  /** propiedades activas que usan cada tipo (para la regla de eliminación). */
  usage = new Map<string, number>();
  private seq = 0;

  private dup(name: string, exceptId?: string) {
    return this.rows.some((r) => r.id !== exceptId && r.name.toLowerCase() === name.toLowerCase());
  }
  private dupError() {
    return Object.assign(new Error("Duplicate entry 'x' for key 'property_types.IDX_name'"), {
      code: 'ER_DUP_ENTRY',
    });
  }

  seed(name: string, extra: Partial<PropertyType> = {}): PropertyType {
    const row = this.create({ name, ...extra });
    row.id = `id-${++this.seq}`;
    row.createdAt = new Date(2026, 0, this.seq);
    this.rows.push(row);
    return row;
  }

  create(data: Partial<PropertyType>): PropertyType {
    return {
      description: null as any,
      hasBedrooms: false,
      hasBathrooms: false,
      hasBuiltSquareMeters: false,
      hasLandSquareMeters: false,
      hasParkingSpaces: false,
      hasFloors: false,
      hasConstructionYear: false,
      deletedAt: null as any,
      ...data,
    } as PropertyType;
  }

  async save(pt: PropertyType): Promise<PropertyType> {
    if (pt.id) {
      const i = this.rows.findIndex((r) => r.id === pt.id);
      if (this.dup(pt.name, pt.id)) throw this.dupError();
      this.rows[i] = pt;
      return pt;
    }
    if (this.dup(pt.name)) throw this.dupError();
    pt.id = `id-${++this.seq}`;
    pt.createdAt = new Date(2026, 0, this.seq);
    this.rows.push(pt);
    return pt;
  }

  private matches(row: PropertyType, where: any = {}, withDeleted = false): boolean {
    if (!withDeleted && row.deletedAt) return false;
    for (const [key, cond] of Object.entries(where)) {
      if (key === 'deletedAt') continue;
      const value = (row as any)[key];
      if (cond instanceof FindOperator) {
        // Like('%texto%') con \ como escape, igual que MySQL
        const pattern = String((cond as any).value ?? (cond as any)._value);
        const regex = new RegExp(
          '^' +
            pattern
              .replace(/\\(.)/g, (_m, c) => `\u0000${c.charCodeAt(0)}\u0000`)
              .replace(/[.*+?^${}()|[\]]/g, '\\$&')
              .replace(/%/g, '.*')
              .replace(/_/g, '.')
              .replace(/\u0000(\d+)\u0000/g, (_m, code) =>
                String.fromCharCode(Number(code)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
              ) +
            '$',
          'i',
        );
        if (!regex.test(String(value))) return false;
      } else if (typeof cond === 'string' && typeof value === 'string') {
        if (value.toLowerCase() !== cond.toLowerCase()) return false;
      } else if (cond !== undefined && cond !== null && value !== cond) {
        return false;
      }
    }
    return true;
  }

  async find(options: any = {}): Promise<PropertyType[]> {
    const out = this.rows.filter((r) => this.matches(r, options.where, options.withDeleted));
    if (options.order?.createdAt === 'DESC') out.sort((a, b) => +b.createdAt - +a.createdAt);
    return out;
  }

  async findOne(options: any = {}): Promise<PropertyType | null> {
    return (await this.find(options))[0] ?? null;
  }

  async update(id: string, patch: Partial<PropertyType>): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (!row) return;
    if (patch.name !== undefined && this.dup(patch.name, id)) throw this.dupError();
    Object.assign(row, patch);
  }

  async softDelete(id: string): Promise<void> {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.deletedAt = new Date();
  }

  async countPropertiesUsing(id: string): Promise<number> {
    return this.usage.get(id) ?? 0;
  }

  createQueryBuilder(): any {
    throw new Error('no usado en estos tests');
  }
}

const names = (rows: PropertyType[]) => rows.map((r) => r.name);

describe('tipos de propiedad · casos de uso', () => {
  let repo: FakeRepo;
  let create: CreatePropertyTypeUseCase;
  let update: UpdatePropertyTypeUseCase;
  let features: UpdatePropertyTypeFeaturesUseCase;
  let remove: SoftDeletePropertyTypeUseCase;
  let findAll: FindAllPropertyTypesUseCase;
  let findOne: FindPropertyTypeUseCase;

  beforeEach(() => {
    repo = new FakeRepo();
    create = new CreatePropertyTypeUseCase(repo);
    update = new UpdatePropertyTypeUseCase(repo);
    features = new UpdatePropertyTypeFeaturesUseCase(repo);
    remove = new SoftDeletePropertyTypeUseCase(repo);
    findAll = new FindAllPropertyTypesUseCase(repo);
    findOne = new FindPropertyTypeUseCase(repo);
  });

  describe('crear', () => {
    it('guarda el tipo con el nombre recortado y las características indicadas', async () => {
      const pt = await create.execute({ name: '  Casa  ', description: ' Una casa ', hasBedrooms: true } as any);
      expect(pt).toMatchObject({ name: 'Casa', description: 'Una casa', hasBedrooms: true, hasBathrooms: false });
      expect(names(repo.rows)).toEqual(['Casa']);
    });

    it('una descripción vacía o de espacios se guarda como null', async () => {
      expect((await create.execute({ name: 'A', description: '   ' } as any)).description).toBeNull();
      expect((await create.execute({ name: 'B' } as any)).description).toBeNull();
    });

    it.each([[''], ['   '], ['\t\n'], [undefined as any], [null as any]])('rechaza el nombre %p', async (name) => {
      await expect(create.execute({ name } as any)).rejects.toThrow(BadRequestException);
      expect(repo.rows).toHaveLength(0);
    });

    it('rechaza un nombre repetido, sin distinguir mayúsculas ni espacios sobrantes', async () => {
      await create.execute({ name: 'Casa' } as any);
      await expect(create.execute({ name: 'Casa' } as any)).rejects.toThrow(/ya existe/);
      await expect(create.execute({ name: 'casa' } as any)).rejects.toThrow(ConflictException);
      await expect(create.execute({ name: '  CASA ' } as any)).rejects.toThrow(ConflictException);
      expect(repo.rows).toHaveLength(1);
    });

    it('un nombre que tenía un tipo ya eliminado se puede volver a usar', async () => {
      const old = repo.seed('Casa', { deletedAt: new Date() });
      const pt = await create.execute({ name: 'Casa' } as any);
      expect(pt.name).toBe('Casa');
      expect(pt.id).not.toBe(old.id);
      // el eliminado sigue ahí, con otro nombre
      expect(old.name).not.toBe('Casa');
      expect(old.deletedAt).toBeTruthy();
    });

    it('si dos creaciones simultáneas chocan en la base, responde "ya existe" y no el error de MySQL', async () => {
      const racy = Object.create(repo) as FakeRepo;
      racy.find = async () => []; // ninguna ve a la otra...
      racy.rows = repo.rows;
      await new CreatePropertyTypeUseCase(repo).execute({ name: 'Casa' } as any);
      const err: any = await new CreatePropertyTypeUseCase(racy).execute({ name: 'Casa' } as any).catch((e) => e);
      expect(err).toBeInstanceOf(ConflictException);
      expect(err.message).toMatch(/ya existe/);
      expect(err.message).not.toMatch(/Duplicate entry/i);
    });
  });

  describe('actualizar', () => {
    it('cambia nombre y descripción', async () => {
      const a = repo.seed('Casa');
      const out = await update.execute(a.id, { name: '  Casa grande ', description: ' texto ' });
      expect(out).toMatchObject({ name: 'Casa grande', description: 'texto' });
    });

    it('rechaza un nombre vacío o de espacios sin tocar el existente', async () => {
      const a = repo.seed('Casa');
      await expect(update.execute(a.id, { name: '' })).rejects.toThrow(BadRequestException);
      await expect(update.execute(a.id, { name: '   ' })).rejects.toThrow(BadRequestException);
      expect(a.name).toBe('Casa');
    });

    it('rechaza renombrar a uno que ya existe', async () => {
      repo.seed('Casa');
      const b = repo.seed('Depto');
      await expect(update.execute(b.id, { name: 'casa' })).rejects.toThrow(/ya existe/);
      expect(b.name).toBe('Depto');
    });

    it('permite cambiar solo las mayúsculas del propio nombre', async () => {
      const a = repo.seed('casa');
      await expect(update.execute(a.id, { name: 'Casa' })).resolves.toMatchObject({ name: 'Casa' });
    });

    it('permite usar el nombre de un tipo eliminado', async () => {
      repo.seed('Local', { deletedAt: new Date() });
      const a = repo.seed('Comercial');
      await expect(update.execute(a.id, { name: 'Local' })).resolves.toMatchObject({ name: 'Local' });
    });

    it('descripción vacía la borra; si no se envía, se conserva', async () => {
      const a = repo.seed('Casa', { description: 'vieja' });
      await update.execute(a.id, { name: 'Casa 2' });
      expect(a.description).toBe('vieja');
      await update.execute(a.id, { description: '   ' });
      expect(a.description).toBeNull();
    });

    it('ignora campos que no se pueden cambiar (id, fechas, borrado)', async () => {
      const a = repo.seed('Casa');
      const id = a.id;
      await update.execute(a.id, { id: 'otro', deletedAt: new Date(), createdAt: new Date(0), name: 'Casa 2' } as any);
      expect(a.id).toBe(id);
      expect(a.deletedAt).toBeFalsy();
      expect(a.createdAt.getTime()).not.toBe(0);
    });

    it('404 si no existe o está eliminado', async () => {
      const gone = repo.seed('Viejo', { deletedAt: new Date() });
      await expect(update.execute('nope', { name: 'X' })).rejects.toThrow(NotFoundException);
      await expect(update.execute(gone.id, { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('características', () => {
    it('activa y desactiva solo las que se envían', async () => {
      const a = repo.seed('Casa', { hasBedrooms: true });
      await features.execute(a.id, { hasBathrooms: true, hasBedrooms: false });
      expect(a).toMatchObject({ hasBedrooms: false, hasBathrooms: true, hasFloors: false });
    });

    it('ignora campos que no son características (nombre, id, borrado)', async () => {
      const a = repo.seed('Casa');
      await features.execute(a.id, { name: 'Hack', id: 'x', deletedAt: new Date(), hasFloors: true } as any);
      expect(a).toMatchObject({ name: 'Casa', hasFloors: true });
      expect(a.deletedAt).toBeFalsy();
    });

    it('404 si no existe', async () => {
      await expect(features.execute('nope', { hasFloors: true })).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminar', () => {
    it('elimina un tipo sin propiedades y libera su nombre para volver a usarlo', async () => {
      const a = repo.seed('Bodega');
      await remove.execute(a.id);
      expect(a.deletedAt).toBeTruthy();
      expect(names(await findAll.execute())).toEqual([]);
      await expect(create.execute({ name: 'Bodega' } as any)).resolves.toMatchObject({ name: 'Bodega' });
    });

    it('no elimina un tipo que usan propiedades y explica cuántas', async () => {
      const a = repo.seed('Casa');
      repo.usage.set(a.id, 40);
      const err: any = await remove.execute(a.id).catch((e) => e);
      expect(err).toBeInstanceOf(ConflictException);
      expect(err.message).toMatch(/Casa/);
      expect(err.message).toBe('No se puede eliminar "Casa": 40 propiedades lo usan. Cámbiales el tipo antes de eliminarlo.');
      expect(a.deletedAt).toBeFalsy();
    });

    it('singular cuando es una sola propiedad', async () => {
      const a = repo.seed('Casa');
      repo.usage.set(a.id, 1);
      await expect(remove.execute(a.id)).rejects.toThrow('No se puede eliminar "Casa": 1 propiedad lo usa. Cámbiale el tipo antes de eliminarlo.');
    });

    it('404 si no existe o ya estaba eliminado', async () => {
      const a = repo.seed('Casa');
      await remove.execute(a.id);
      await expect(remove.execute(a.id)).rejects.toThrow(NotFoundException);
      await expect(remove.execute('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listar y buscar', () => {
    beforeEach(() => {
      repo.seed('Casa');
      repo.seed('Casa de campo');
      repo.seed('Departamento');
      repo.seed('100% terreno');
      repo.seed('Local_1');
      repo.seed('Eliminado', { deletedAt: new Date() });
    });

    it('lista del más reciente al más antiguo y sin eliminados', async () => {
      expect(names(await findAll.execute())).toEqual(['Local_1', '100% terreno', 'Departamento', 'Casa de campo', 'Casa']);
    });

    it('busca por parte del nombre, sin importar mayúsculas ni espacios alrededor', async () => {
      expect(names(await findAll.execute('  casa '))).toEqual(['Casa de campo', 'Casa']);
      expect(await findAll.execute('   ')).toHaveLength(5);
    });

    it('% y _ se buscan como texto, no como comodines', async () => {
      expect(names(await findAll.execute('%'))).toEqual(['100% terreno']);
      expect(names(await findAll.execute('_'))).toEqual(['Local_1']);
      expect(await findAll.execute('Ca_a')).toHaveLength(0);
    });

    it('no encuentra eliminados', async () => {
      expect(await findAll.execute('Eliminado')).toHaveLength(0);
    });
  });

  describe('leer uno', () => {
    it('devuelve el tipo, y null si no existe o está eliminado', async () => {
      const a = repo.seed('Casa');
      const gone = repo.seed('Viejo', { deletedAt: new Date() });
      expect(await findOne.execute(a.id)).toBe(a);
      expect(await findOne.execute(gone.id)).toBeNull();
      expect(await findOne.execute('nope')).toBeNull();
    });
  });
});

describe('PropertyTypesService · errores', () => {
  const make = (createImpl: any, updateImpl: any = jest.fn()) =>
    new PropertyTypesService(
      { execute: createImpl } as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      { execute: updateImpl } as any,
      {} as any,
      {} as any,
    );

  it('un error inesperado de la base no se muestra como conflicto ni con su texto técnico', async () => {
    const boom = new Error("Data too long for column 'name' at row 1");
    const service = make(jest.fn().mockRejectedValue(boom), jest.fn().mockRejectedValue(boom));
    const c: any = await service.create({ name: 'x' } as any).catch((e) => e);
    const u: any = await service.update('id', { name: 'x' }).catch((e) => e);
    for (const err of [c, u]) {
      expect(err).toBeInstanceOf(InternalServerErrorException);
      expect(err).not.toBeInstanceOf(ConflictException);
      expect(String(err.message)).toBe('No se pudo guardar el tipo de propiedad. Inténtalo de nuevo.');
      expect(String(err.message)).not.toMatch(/Data too long/);
    }
  });

  it('un choque de nombre único (carrera) se ve como "ya existe"', async () => {
    const dup = Object.assign(new Error("Duplicate entry 'Casa' for key 'x'"), { code: 'ER_DUP_ENTRY' });
    const service = make(jest.fn().mockRejectedValue(dup), jest.fn().mockRejectedValue(dup));
    for (const run of [() => service.create({ name: 'Casa' } as any), () => service.update('id', { name: 'Casa' })]) {
      const err: any = await run().catch((e) => e);
      expect(err).toBeInstanceOf(ConflictException);
      expect(err.message).toBe('El nombre del tipo de propiedad ya existe');
    }
  });

  it('los errores HTTP de los casos de uso pasan tal cual', async () => {
    const nf = new NotFoundException('Tipo de propiedad no encontrado');
    const service = make(jest.fn(), jest.fn().mockRejectedValue(nf));
    await expect(service.update('id', {})).rejects.toBe(nf);
  });
});

describe('tipos de propiedad · validación de entrada (DTO)', () => {
  const pipe = new ValidationPipe({ transform: true, whitelist: true });
  const run = (metatype: any, value: any) => pipe.transform(value, { type: 'body', metatype });
  const msgs = async (metatype: any, value: any): Promise<string[]> => {
    try {
      await run(metatype, value);
      return [];
    } catch (e: any) {
      return [].concat(e.getResponse().message);
    }
  };

  it('crear: recorta el nombre y la descripción', async () => {
    const dto = await run(CreatePropertyTypeDto, { name: '  Casa  ', description: '  texto  ' });
    expect(dto).toMatchObject({ name: 'Casa', description: 'texto' });
  });

  it.each([[''], ['   '], [undefined], [null], [123], [{}]])('crear: rechaza el nombre %p', async (name) => {
    expect((await msgs(CreatePropertyTypeDto, { name })).length).toBeGreaterThan(0);
  });

  it('crear: máximo 255 caracteres en el nombre', async () => {
    expect(await msgs(CreatePropertyTypeDto, { name: 'x'.repeat(255) })).toEqual([]);
    expect((await msgs(CreatePropertyTypeDto, { name: 'x'.repeat(256) })).join(' ')).toMatch(/name/);
  });

  it('crear: máximo 2000 caracteres en la descripción', async () => {
    expect(await msgs(CreatePropertyTypeDto, { name: 'A', description: 'x'.repeat(2000) })).toEqual([]);
    expect((await msgs(CreatePropertyTypeDto, { name: 'A', description: 'x'.repeat(2001) })).join(' ')).toMatch(/description/);
  });

  it('crear: las características deben ser booleanas', async () => {
    expect((await msgs(CreatePropertyTypeDto, { name: 'A', hasBedrooms: 'si' })).join(' ')).toMatch(/hasBedrooms must be a boolean/);
    expect(await msgs(CreatePropertyTypeDto, { name: 'A', hasBedrooms: true, hasFloors: false })).toEqual([]);
  });

  it('crear: descarta lo que no es del tipo (id, fechas, borrado)', async () => {
    const dto: any = await run(CreatePropertyTypeDto, { name: 'A', id: 'x', deletedAt: '2020-01-01', createdAt: 'y', hasBedrooms: true });
    const defined = Object.entries(dto).filter(([, v]) => v !== undefined).map(([k]) => k).sort();
    expect(defined).toEqual(['hasBedrooms', 'name']);
    expect(dto).not.toHaveProperty('id');
    expect(dto).not.toHaveProperty('deletedAt');
  });

  it('actualizar: todo es opcional, pero un nombre enviado no puede quedar vacío', async () => {
    expect(await msgs(UpdatePropertyTypeDto, {})).toEqual([]);
    expect(await msgs(UpdatePropertyTypeDto, { description: 'solo descripción' })).toEqual([]);
    expect((await msgs(UpdatePropertyTypeDto, { name: '' })).length).toBeGreaterThan(0);
    expect((await msgs(UpdatePropertyTypeDto, { name: '   ' })).length).toBeGreaterThan(0);
    expect((await msgs(UpdatePropertyTypeDto, { name: 'x'.repeat(256) })).length).toBeGreaterThan(0);
  });

  it('actualizar: permite vaciar la descripción', async () => {
    const dto: any = await run(UpdatePropertyTypeDto, { description: '   ' });
    expect(dto.description).toBe('');
  });

  it('características: solo booleanos y nada más', async () => {
    expect((await msgs(UpdatePropertyTypeFeaturesDto, { hasFloors: 'x' })).length).toBeGreaterThan(0);
    const dto: any = await run(UpdatePropertyTypeFeaturesDto, { hasFloors: true, name: 'Hack', id: 'x' });
    expect(Object.entries(dto).filter(([, v]) => v !== undefined).map(([k]) => k)).toEqual(['hasFloors']);
    expect(dto).not.toHaveProperty('name');
  });
});

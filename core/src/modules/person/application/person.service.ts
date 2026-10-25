import {
  Injectable,
  NotFoundException,
  HttpException,
  ConflictException,
} from '@nestjs/common';
import { Repository, IsNull, In } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from '../domain/person.entity';
import { User } from '../../users/domain/user.entity';
import { Multimedia } from '../../multimedia/domain/multimedia.entity';
import { CreatePersonDto, UpdatePersonDto } from '../dto/person.dto';
import { CreatePersonUseCase } from './use-cases/create-person.usecase';
import { FindAllPersonsUseCase } from './use-cases/find-all-persons.usecase';
import { FindPersonUseCase } from './use-cases/find-person.usecase';
import { UpdatePersonUseCase } from './use-cases/update-person.usecase';
import { RemovePersonUseCase } from './use-cases/remove-person.usecase';
import { SearchPersonsUseCase } from './use-cases/search-persons.usecase';
import { VerifyPersonUseCase } from './use-cases/verify-person.usecase';
import { UnverifyPersonUseCase } from './use-cases/unverify-person.usecase';
import { RequestVerificationUseCase } from './use-cases/request-verification.usecase';
import { LinkUserUseCase } from './use-cases/link-user.usecase';
import { UnlinkUserUseCase } from './use-cases/unlink-user.usecase';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly createPersonUseCase: CreatePersonUseCase,
    private readonly findAllPersonsUseCase: FindAllPersonsUseCase,
    private readonly findPersonUseCase: FindPersonUseCase,
    private readonly updatePersonUseCase: UpdatePersonUseCase,
    private readonly removePersonUseCase: RemovePersonUseCase,
    private readonly searchPersonsUseCase: SearchPersonsUseCase,
    private readonly verifyPersonUseCase: VerifyPersonUseCase,
    private readonly unverifyPersonUseCase: UnverifyPersonUseCase,
    private readonly requestVerificationUseCase: RequestVerificationUseCase,
    private readonly linkUserUseCase: LinkUserUseCase,
    private readonly unlinkUserUseCase: UnlinkUserUseCase,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const p: Person = {
      id: undefined as any,
      name: createPersonDto.name || '',
      dni: createPersonDto.dni,
      userId: createPersonDto.userId,
      address: createPersonDto.address,
      city: createPersonDto.city,
      state: createPersonDto.state,
      phone: createPersonDto.phone,
      email: createPersonDto.email,
      verified: createPersonDto.verified || false,
      verificationRequest: createPersonDto.verificationRequest as any,
      dniCardFrontId: createPersonDto.dniCardFrontId,
      dniCardRearId: createPersonDto.dniCardRearId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    return await this.createPersonUseCase.execute(p);
  }

  async findAll(): Promise<Person[]> {
    return await this.findAllPersonsUseCase.execute();
  }

  async findAllIncludingUsers(): Promise<any[]> {
    // use use-case to get persons
    const persons = await this.findAllPersonsUseCase.execute();

    const usersWithoutPerson = await this.userRepository.find({
      where: { personId: IsNull() },
      relations: ['person'],
    });

    const usersAsPersons = usersWithoutPerson.map(user => ({
      id: user.id,
      name: user.personalInfo?.firstName && user.personalInfo?.lastName
        ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`
        : user.username,
      email: user.email,
      phone: user.personalInfo?.phone,
      address: user.personalInfo?.address,
      city: user.personalInfo?.city,
      state: user.personalInfo?.state,
      verified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      user: user,
      userRole: user.role,
      userStatus: user.status,
      isFromUser: true,
    }));

    return [...persons, ...usersAsPersons];
  }

  async findGrid(query: any = {}): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const merged = await this.findAllIncludingUsers();
    const filtrationOn = query.filtration === true || query.filtration === 'true';
    const filters = filtrationOn ? parsePeopleFilters(query.filters) : {};
    const search = typeof query.search === 'string' ? query.search.trim().toLowerCase() : '';

    let rows = merged.filter((row) => personMatches(row, filters, search));

    const sortField = typeof query.sortField === 'string' ? query.sortField : 'name';
    const direction = query.sort === 'desc' ? -1 : query.sort === 'asc' ? 1 : 1;
    const useSort = query.sort === 'asc' || query.sort === 'desc';
    rows = [...rows].sort((a, b) => {
      if (!useSort) {
        return comparePersonValues(b.createdAt, a.createdAt);
      }
      const field = ['name', 'userRole', 'dni', 'verified', 'verificationRequest', 'createdAt'].includes(sortField)
        ? sortField
        : 'createdAt';
      return comparePersonValues(personSortValue(a, field), personSortValue(b, field)) * direction;
    });

    const exportAll = query.pagination === false || query.pagination === 'false';
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 25);
    const total = rows.length;
    const data = exportAll ? rows : rows.slice((page - 1) * limit, page * limit);
    return { data, total, page: exportAll ? 1 : page, limit: exportAll ? total : limit };
  }

  async exportExcel(query: any = {}): Promise<Buffer> {
    const { data } = await this.findGrid({ ...query, pagination: 'false' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Personas');
    sheet.columns = [
      { key: 'name', header: 'Nombre', width: 28 },
      { key: 'userRole', header: 'Rol', width: 16 },
      { key: 'dni', header: 'DNI', width: 16 },
      { key: 'verified', header: 'Verificado', width: 14 },
      { key: 'createdAt', header: 'Fecha registro', width: 22 },
    ];
    for (const row of data) {
      sheet.addRow({
        name: row.name || '',
        userRole: personRoleLabel(row),
        dni: row.dni || '',
        verified: row.verified ? 'Sí' : 'No',
        createdAt: row.createdAt || '',
      });
    }
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async findOne(id: string): Promise<Person> {
    const person = await this.findPersonUseCase.execute(id);
    if (person) {
      return person;
    }

    // Listado `/people/all` incluye usuarios sin ficha; resolver por userId → personId.
    const linked = await this.findPersonLinkedToUser(id);
    if (linked) {
      return linked;
    }

    throw new NotFoundException('Persona no encontrada');
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person> {
    const patch = { ...updatePersonDto } as Partial<Person>;
    try {
      const personId = await this.resolvePersonId(id);
      return await this.updatePersonUseCase.execute(personId, patch);
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if (err instanceof Error && err.message.includes('no encontrada')) {
        throw new NotFoundException(err.message);
      }
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    // No se borra a quien participa en un contrato en proceso: el contrato quedaría sin esa parte.
    const rows = (await this.userRepository.manager.query(
      `SELECT code FROM contracts
       WHERE deletedAt IS NULL AND status = 'IN_PROCESS'
         AND JSON_SEARCH(people, 'one', ?, NULL, '$[*].personId') IS NOT NULL`,
      [id],
    )) as Array<{ code: string }>;
    if (rows.length > 0) {
      throw new ConflictException(
        `La persona participa en contratos en proceso (${rows.map((r) => r.code).join(', ')}). Ciérralos o quítala de ellos antes de eliminarla.`,
      );
    }
    await this.removePersonUseCase.execute(id);
  }

  async getPersonsForSearch(): Promise<Array<{ id: string; name: string; dni: string }>> {
    return await this.searchPersonsUseCase.execute();
  }

  async verify(id: string): Promise<Person> {
    const personId = await this.ensurePersonId(id);
    await this.verifyPersonUseCase.execute(personId);
    const verified = await this.findPersonUseCase.execute(personId);
    if (!verified) {
      throw new NotFoundException('Persona no encontrada');
    }
    return verified;
  }

  async unverify(id: string): Promise<Person> {
    const personId = await this.ensurePersonId(id);
    await this.unverifyPersonUseCase.execute(personId);
    const person = await this.findPersonUseCase.execute(personId);
    if (!person) {
      throw new NotFoundException('Persona no encontrada');
    }
    return person;
  }

  async requestVerification(id: string): Promise<void> {
    const personId = await this.ensurePersonId(id);
    await this.requestVerificationUseCase.execute(personId);
  }

  /**
   * Resuelve un id de persona (o de usuario sin ficha) al id real de `persons`.
   * No crea registros.
   */
  private async resolvePersonId(id: string): Promise<string> {
    const person = await this.findPersonUseCase.execute(id);
    if (person) {
      return person.id;
    }

    const linked = await this.findPersonLinkedToUser(id);
    if (linked) {
      return linked.id;
    }

    throw new NotFoundException('Persona no encontrada');
  }

  /**
   * Como `resolvePersonId`, pero si el id es un usuario sin ficha crea la persona
   * y la vincula (necesario para verificar desde el listado unificado).
   */
  private async ensurePersonId(id: string): Promise<string> {
    const person = await this.findPersonUseCase.execute(id);
    if (person) {
      return person.id;
    }

    const linked = await this.findPersonLinkedToUser(id);
    if (linked) {
      return linked.id;
    }

    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException('Persona no encontrada');
    }

    const created = await this.create({
      name:
        user.personalInfo?.firstName && user.personalInfo?.lastName
          ? `${user.personalInfo.firstName} ${user.personalInfo.lastName}`.trim()
          : user.username,
      email: user.email,
      phone: user.personalInfo?.phone ?? undefined,
      address: user.personalInfo?.address ?? undefined,
      city: user.personalInfo?.city ?? undefined,
      state: user.personalInfo?.state ?? undefined,
      userId: user.id,
      verified: false,
    } as CreatePersonDto);

    user.personId = created.id;
    await this.userRepository.save(user);

    return created.id;
  }

  private async findPersonLinkedToUser(userId: string): Promise<Person | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user?.personId) {
      return null;
    }
    return this.findPersonUseCase.execute(user.personId);
  }

  /**
   * true si la ficha `idOrUserId` (id de persona, o id de usuario resuelto a su
   * persona como en findOne) pertenece a `userId`: person.userId === userId o
   * el usuario tiene esa persona vinculada (user.personId).
   */
  /**
   * Verifica que todos los multimedia indicados existan y hayan sido subidos
   * por el usuario dado (multimedia.userId).
   */
  async areMultimediaOwnedByUser(ids: string[], userId: string): Promise<boolean> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (!userId || unique.length === 0) return false;
    const count = await this.userRepository.manager.count(Multimedia, {
      where: { id: In(unique), userId },
    });
    return count === unique.length;
  }

  async isOwnedByUser(idOrUserId: string, userId: string): Promise<boolean> {
    if (!userId) return false;
    let person: Person | null = null;
    try {
      person = await this.findOne(idOrUserId);
    } catch {
      return false;
    }
    if (!person) return false;
    if (person.userId && person.userId === userId) return true;
    const user = await this.userRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    return !!user?.personId && user.personId === person.id;
  }

  async linkUser(id: string, userId: string): Promise<void> {
    await this.linkUserUseCase.execute(id, userId);
  }

  async unlinkUser(id: string): Promise<void> {
    await this.unlinkUserUseCase.execute(id);
  }
}

function parsePeopleFilters(filters?: string): Record<string, string> {
  if (!filters) return {};
  const result: Record<string, string> = {};
  for (const pair of String(filters).split(',')) {
    const [column, ...valueParts] = pair.split('-');
    if (!column || valueParts.length === 0) continue;
    try {
      result[column] = decodeURIComponent(valueParts.join('-'));
    } catch {
      result[column] = valueParts.join('-');
    }
  }
  return result;
}

function personRoleLabel(row: any): string {
  const role = row.userRole || row.user?.role || '';
  const labels: Record<string, string> = {
    ADMIN: 'Admin',
    AGENT: 'Agente',
    COMMUNITY: 'Comunidad',
  };
  return labels[role] || role || '';
}

function personSortValue(row: any, field: string): unknown {
  if (field === 'userRole') return personRoleLabel(row);
  if (field === 'verified') return row.verified ? 1 : 0;
  return row[field];
}

function comparePersonValues(a: unknown, b: unknown): number {
  if (a instanceof Date || b instanceof Date || (typeof a === 'string' && typeof b === 'string' && !Number.isNaN(Date.parse(String(a))) && String(a).includes('T'))) {
    const da = a ? new Date(a as string).getTime() : 0;
    const db = b ? new Date(b as string).getTime() : 0;
    return da - db;
  }
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a ?? '').localeCompare(String(b ?? ''), 'es', { sensitivity: 'base' });
}

function personMatches(row: any, filters: Record<string, string>, search: string): boolean {
  const role = personRoleLabel(row);
  const rawRole = String(row.userRole || row.user?.role || '');
  const haystack = [row.name, row.dni, row.email, role, rawRole].filter(Boolean).join(' ').toLowerCase();
  if (search && !haystack.includes(search)) return false;

  const text = (value: unknown, filter?: string) =>
    !filter || String(value ?? '').toLowerCase().includes(filter.toLowerCase());

  if (!text(row.name, filters.name)) return false;
  if (filters.userRole) {
    const needle = filters.userRole.toLowerCase();
    if (!role.toLowerCase().includes(needle) && !rawRole.toLowerCase().includes(needle)) return false;
  }
  if (!text(row.dni, filters.dni)) return false;
  if (filters.verified) {
    const needle = filters.verified.toLowerCase();
    const yes = ['1', 'true', 'si', 'sí', 'yes'].includes(needle);
    const no = ['0', 'false', 'no'].includes(needle);
    if (yes && !row.verified) return false;
    if (no && row.verified) return false;
    if (!yes && !no && !String(row.verified).toLowerCase().includes(needle)) return false;
  }
  if (filters.createdAt) {
    const date = row.createdAt ? new Date(row.createdAt) : null;
    const formatted = date && !Number.isNaN(date.getTime())
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${date.toLocaleDateString('es-CL')}`
      : '';
    if (!formatted.toLowerCase().includes(filters.createdAt.toLowerCase())) return false;
  }
  return true;
}

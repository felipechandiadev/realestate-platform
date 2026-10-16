import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserRole, UserStatus } from '../../domain/user.entity';

@Injectable()
export class FindAdminUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(filters: any): Promise<any> {
    const { search, status } = filters || {};
    const filtrationOn = filters?.filtration === true || filters?.filtration === 'true';
    const columnFilters = filtrationOn ? parseUserFilters(filters?.filters) : {};
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.ADMIN })
      .andWhere('user.deletedAt IS NULL');

    applyUserGridQuery(qb, { search, status: status || columnFilters.status, columnFilters });
    applyUserSort(qb, filters?.sortField, filters?.sort);

    const exportAll = filters?.pagination === false || filters?.pagination === 'false';
    const paginate = !exportAll && (filters?.pagination === 'true' || filters?.pagination === true || filters?.page);
    const hasGridQuery = Boolean(
      filters?.page ||
        filters?.limit ||
        filters?.sort ||
        filters?.sortField ||
        filters?.filters ||
        filters?.filtration !== undefined ||
        filters?.pagination !== undefined ||
        filters?.search,
    );
    const page = Math.max(1, parseInt(filters?.page, 10) || 1);
    const limit = Math.max(1, parseInt(filters?.limit, 10) || 25);
    const total = await qb.getCount();
    const admins = paginate
      ? await qb.skip((page - 1) * limit).take(limit).getMany()
      : await qb.getMany();
    admins.forEach((admin: any) => delete admin.password);
    if (!paginate && !exportAll && !hasGridQuery) {
      return admins;
    }
    return { data: admins, total, page: paginate ? page : 1, limit: paginate ? limit : admins.length };
  }
}

const USER_NAME_SQL =
  "TRIM(CONCAT(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.firstName')), ''), ' ', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.lastName')), '')))";

export function parseUserFilters(filters?: string): Record<string, string> {
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

export function applyUserGridQuery(
  qb: { andWhere: (sql: string, params?: Record<string, unknown>) => unknown },
  input: { search?: string; status?: string; columnFilters: Record<string, string> },
) {
  const { search, columnFilters } = input;
  if (input.status) {
    qb.andWhere('user.status = :status', { status: input.status });
  }
  if (columnFilters.email) {
    qb.andWhere('LOWER(user.email) LIKE LOWER(:emailFilter)', { emailFilter: `%${columnFilters.email}%` });
  }
  if (columnFilters.name || columnFilters.firstName) {
    const name = columnFilters.name || columnFilters.firstName;
    qb.andWhere(`LOWER(${USER_NAME_SQL}) LIKE LOWER(:nameFilter)`, { nameFilter: `%${name}%` });
  }
  if (columnFilters.username) {
    qb.andWhere('LOWER(user.username) LIKE LOWER(:usernameFilter)', { usernameFilter: `%${columnFilters.username}%` });
  }
  if (columnFilters.role) {
    qb.andWhere('LOWER(user.role) LIKE LOWER(:roleFilter)', { roleFilter: `%${columnFilters.role}%` });
  }
  if (columnFilters.lastName) {
    qb.andWhere(
      "LOWER(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.lastName')), '')) LIKE LOWER(:lastNameFilter)",
      { lastNameFilter: `%${columnFilters.lastName}%` },
    );
  }
  if (columnFilters.createdAt) {
    qb.andWhere(
      "(DATE_FORMAT(user.createdAt, '%Y-%m-%d %H:%i') LIKE :createdAtFilter OR DATE_FORMAT(user.createdAt, '%d-%m-%Y') LIKE :createdAtFilter)",
      { createdAtFilter: `%${columnFilters.createdAt}%` },
    );
  }
  if (search) {
    qb.andWhere(
      `(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(${USER_NAME_SQL}) LIKE :search)`,
      { search: `%${search.toLowerCase()}%` },
    );
  }
}

export function applyUserSort(qb: { orderBy: (col: string, dir: 'ASC' | 'DESC') => unknown }, sortField?: string, sort?: string) {
  const allowed: Record<string, string> = {
    email: 'user.email',
    name: USER_NAME_SQL,
    firstName: USER_NAME_SQL,
    username: 'user.username',
    role: 'user.role',
    status: 'user.status',
    createdAt: 'user.createdAt',
    updatedAt: 'user.updatedAt',
  };
  const ordered = sort === 'asc' || sort === 'desc';
  const column = ordered ? allowed[sortField || ''] || 'user.createdAt' : 'user.createdAt';
  qb.orderBy(column, ordered && sort === 'asc' ? 'ASC' : 'DESC');
}

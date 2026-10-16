import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserRole } from '../../domain/user.entity';
import { User } from '../../domain/user.entity';
import { applyUserGridQuery, applyUserSort, parseUserFilters } from './find-admin-users.usecase';

@Injectable()
export class ListAgentsUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(params: {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
    sortField?: string;
    filters?: string;
    filtration?: string | boolean;
    pagination?: string | boolean;
    status?: string;
  }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 25);
    const exportAll = params.pagination === false || params.pagination === 'false';
    const filtrationOn = params.filtration === true || params.filtration === 'true';
    const columnFilters = filtrationOn ? parseUserFilters(params.filters) : {};

    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.role = :role', { role: UserRole.AGENT });

    applyUserGridQuery(qb, {
      search: params.search,
      status: params.status || columnFilters.status,
      columnFilters,
    });
    applyUserSort(qb, params.sortField, params.sort);

    const total = await qb.getCount();
    const data = exportAll ? await qb.getMany() : await qb.skip((page - 1) * limit).take(limit).getMany();
    data.forEach((agent: any) => delete agent.password);
    return { data, total, page: exportAll ? 1 : page, limit: exportAll ? data.length : limit };
  }
}
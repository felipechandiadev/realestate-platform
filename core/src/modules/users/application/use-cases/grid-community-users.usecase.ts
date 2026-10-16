import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { applyUserGridQuery, applyUserSort, parseUserFilters } from './find-admin-users.usecase';

@Injectable()
export class GridCommunityUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(query: any): Promise<any> {
    const filtrationOn = query?.filtration === true || query?.filtration === 'true';
    const columnFilters = filtrationOn ? parseUserFilters(query?.filters) : {};
    const page = Math.max(1, parseInt(query?.page, 10) || 1);
    const limit = Math.max(1, parseInt(query?.limit, 10) || 25);
    const exportAll = query?.pagination === false || query?.pagination === 'false';

    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: 'COMMUNITY' })
      .andWhere('user.deletedAt IS NULL');

    applyUserGridQuery(qb, {
      search: query?.search,
      status: columnFilters.status,
      columnFilters,
    });
    applyUserSort(qb, query?.sortField, query?.sort);

    const total = await qb.getCount();
    const users = exportAll ? await qb.getMany() : await qb.skip((page - 1) * limit).take(limit).getMany();
    const data = users.map((user: any) => {
      delete user.password;
      const personalInfo = user.personalInfo || {};
      return {
        ...user,
        firstName: personalInfo?.firstName || '',
        lastName: personalInfo?.lastName || '',
      };
    });

    return {
      data,
      total,
      page: exportAll ? 1 : page,
      limit: exportAll ? Math.max(total, 1) : limit,
      totalPages: exportAll ? 1 : Math.ceil(total / limit),
    };
  }
}
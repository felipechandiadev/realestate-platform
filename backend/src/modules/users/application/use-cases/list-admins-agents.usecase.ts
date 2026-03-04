import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { User } from '../../domain/user.entity';

@Injectable()
export class ListAdminsAgentsUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(params: { search?: string; page?: number; limit?: number }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { search, page = 1, limit = 10 } = params;

    const qb = this.userRepo.createQueryBuilder('user');
    qb.where('user.deletedAt IS NULL');

    if (search) {
      const normalized = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.firstName'))) LIKE :search OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.lastName'))) LIKE :search)`,
        { search: normalized },
      );
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, page, limit };
  }
}

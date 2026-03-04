import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserRole } from '../../domain/user.entity';
import { User } from '../../domain/user.entity';

@Injectable()
export class ListAgentsUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(params: { search?: string; page?: number; limit?: number }): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const { search, page = 1, limit = 10 } = params;

    const qb = this.userRepo.createQueryBuilder('user')
      .where('user.deletedAt IS NULL')
      .andWhere('user.role = :role', { role: UserRole.AGENT })
      .orderBy("JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.firstName'))", 'ASC');

    if (search) {
      const normalizedSearch = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.firstName'))) LIKE :search OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.lastName'))) LIKE :search OR LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search)`,
        { search: normalizedSearch },
      );
    }

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit };
  }
}
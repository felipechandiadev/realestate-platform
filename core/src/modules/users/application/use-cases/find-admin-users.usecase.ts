import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/user.repository';
import { UserRole, UserStatus } from '../../domain/user.entity';

@Injectable()
export class FindAdminUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(filters: any): Promise<any[]> {
    const { search, status } = filters || {};
    const qb = this.userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.ADMIN })
      .andWhere('user.deletedAt IS NULL')
      .orderBy('user.createdAt', 'DESC');

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }
    if (search) {
      const normalizedSearch = `%${search.toLowerCase()}%`;
      qb.andWhere(
        `(LOWER(user.username) LIKE :search OR LOWER(user.email) LIKE :search OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.firstName'))) LIKE :search OR LOWER(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.lastName'))) LIKE :search OR LOWER(TRIM(CONCAT(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.firstName')), ''), ' ', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(user.personalInfo, '$.lastName')), '')))) LIKE :search)`,
        { search: normalizedSearch },
      );
    }

    const admins = await qb.getMany();
    admins.forEach((a: any) => delete a.password);
    return admins;
  }
}

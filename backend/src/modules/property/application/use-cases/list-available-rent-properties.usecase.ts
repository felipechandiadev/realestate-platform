import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { ListAvailableRentPropertiesDto } from '../..//dto/list-available-rent-properties.dto';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';

@Injectable()
export class ListAvailableRentPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(queryDto: ListAvailableRentPropertiesDto): Promise<any[]> {
    const limit = Math.min(Math.max(queryDto.limit ?? 100, 1), 500);

    const qb = this.propertyRepository
      .createQueryBuilder('p')
      .leftJoin('p.propertyType', 'pt')
      .where('p.deletedAt IS NULL')
      .andWhere('p.operationType = :operation', { operation: PropertyOperationType.RENT })
      .andWhere('p.price IS NOT NULL')
      .andWhere('p.price > 0');

    const allowedStatuses = [
      PropertyStatus.PUBLISHED,
      PropertyStatus.PRE_APPROVED,
      PropertyStatus.CONTRACT_IN_PROGRESS,
      PropertyStatus.REQUEST,
    ];

    qb.andWhere('p.status IN (:...statuses)', { statuses: allowedStatuses });

    if (queryDto.search && queryDto.search.trim() !== '') {
      const needle = `%${queryDto.search.trim().toLowerCase()}%`;
      qb.andWhere(
        `(
          LOWER(p.title) LIKE :needle OR
          LOWER(p.code) LIKE :needle OR
          LOWER(p.city) LIKE :needle OR
          LOWER(p.state) LIKE :needle
        )`,
        { needle },
      );
    }

    qb.select([
      'p.id AS id',
      'p.code AS code',
      'p.title AS title',
      'p.status AS status',
      'p.city AS city',
      'p.state AS state',
      'p.price AS price',
      'p.currencyPrice AS currencyPrice',
      'p.mainImageUrl AS mainImageUrl',
      'pt.id AS propertyTypeId',
      'pt.name AS propertyTypeName',
    ]);

    qb.orderBy('p.updatedAt', 'DESC').addOrderBy('p.createdAt', 'DESC');
    qb.limit(limit);

    const rows = await qb.getRawMany();

    return rows.map((row: Record<string, any>) => ({
      id: row.id,
      code: row.code,
      title: row.title,
      status: row.status,
      city: row.city,
      state: row.state,
      price:
        typeof row.price === 'number'
          ? row.price
          : row.price !== null && row.price !== undefined
          ? Number(row.price)
          : 0,
      currencyPrice: row.currencyPrice,
      mainImageUrl: row.mainImageUrl,
      propertyTypeId: row.propertyTypeId,
      propertyTypeName: row.propertyTypeName,
    }));
  }
}

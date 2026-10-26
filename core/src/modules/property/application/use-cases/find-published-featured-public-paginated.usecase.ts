import { Injectable } from '@nestjs/common';
import { toPublicPropertyListItem } from '../public-property.mapper';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

@Injectable()
export class FindPublishedFeaturedPublicPaginatedUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(
    page: number = 1,
    limit: number = 9,
  ): Promise<{
    data: Array<Record<string, unknown>>;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // Prefer lastModifiedAt so newly featured properties surface on page 1
    // (SEO/featured save updates lastModifiedAt). Then publishedAt / createdAt.
    const qb = this.propertyRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .where('p.status = :status', { status: PropertyStatus.PUBLISHED })
      .andWhere('p.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.lastModifiedAt', 'DESC')
      .addOrderBy('p.publishedAt', 'DESC')
      .addOrderBy('p.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data: rows.map(toPublicPropertyListItem), total, page, limit, totalPages };
  }
}

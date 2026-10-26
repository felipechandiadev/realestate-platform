import { Injectable } from '@nestjs/common';
import { toPublicPropertyListItem } from '../public-property.mapper';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

@Injectable()
export class FindPublishedFeaturedPublicUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(): Promise<Array<Record<string, unknown>>> {
    const qb = this.propertyRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .where('p.status = :status', { status: PropertyStatus.PUBLISHED })
      .andWhere('p.isFeatured = :isFeatured', { isFeatured: true })
      .andWhere('p.deletedAt IS NULL')
      .orderBy('p.lastModifiedAt', 'DESC')
      .addOrderBy('p.publishedAt', 'DESC')
      .addOrderBy('p.createdAt', 'DESC');

    const rows = await qb.getMany();
    return rows.map(toPublicPropertyListItem);
  }
}

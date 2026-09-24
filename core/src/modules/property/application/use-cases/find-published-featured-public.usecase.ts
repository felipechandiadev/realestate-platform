import { Injectable } from '@nestjs/common';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

@Injectable()
export class FindPublishedFeaturedPublicUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(): Promise<Partial<Property>[]> {
    const qb = this.propertyRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .where('p.status = :status', { status: PropertyStatus.PUBLISHED })
      .andWhere('p.isFeatured = :isFeatured', { isFeatured: true });

    const rows = await qb.getMany();
    return rows as Partial<Property>[];
  }
}

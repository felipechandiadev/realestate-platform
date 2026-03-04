import { Injectable } from '@nestjs/common';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

@Injectable()
export class FindPublishedFeaturedPublicPaginatedUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(
    page: number = 1,
    limit: number = 9,
  ): Promise<{
    data: Partial<Property>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const qb = this.propertyRepository.createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.multimedia', 'multimedia')
      .select([
        'p.id',
        'p.title',
        'p.price',
        'p.currencyPrice',
        'p.city',
        'p.state',
        'p.mainImageUrl',
        'p.isFeatured',
        'p.publishedAt',
        'p.bedrooms',
        'p.bathrooms',
        'p.builtSquareMeters',
        'p.landSquareMeters',
        'p.parkingSpaces',
        'p.operationType',
        'p.favorites',
        'pt.id',
        'pt.name',
        'pt.hasBedrooms',
        'pt.hasBathrooms',
        'pt.hasBuiltSquareMeters',
        'pt.hasLandSquareMeters',
        'pt.hasParkingSpaces',
        'pt.hasFloors',
        'pt.hasConstructionYear',
      ])
      .where('p.status = :status', { status: PropertyStatus.PUBLISHED })
      .andWhere('p.isFeatured = :isFeatured', { isFeatured: true })
      .orderBy('p.publishedAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return { data: rows as Partial<Property>[], total, page, limit, totalPages };
  }
}

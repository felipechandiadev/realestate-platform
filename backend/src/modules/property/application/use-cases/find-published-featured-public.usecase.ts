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
      .andWhere('p.isFeatured = :isFeatured', { isFeatured: true });

    const rows = await qb.getMany();
    return rows as Partial<Property>[];
  }
}

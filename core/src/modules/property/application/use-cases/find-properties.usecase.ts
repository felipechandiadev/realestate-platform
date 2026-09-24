import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';

@Injectable()
export class FindPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(filters: any = {}): Promise<Property[]> {
    const query = this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.creatorUser', 'creatorUser')
      .leftJoinAndSelect('property.assignedAgent', 'assignedAgent')
      .leftJoinAndSelect('property.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .where({ deletedAt: IsNull() });

    if (filters.operationType) {
      query.andWhere('property.operationType = :operationType', {
        operationType: filters.operationType,
      });
    }

    if (filters.status) {
      query.andWhere('property.status = :status', { status: filters.status });
    }

    if (filters.propertyTypeId || filters.propertyType) {
      const pTypeId = filters.propertyTypeId || filters.propertyType;
      query.andWhere('property.propertyTypeId = :propertyTypeId', {
        propertyTypeId: pTypeId,
      });
    }

    if (filters.state) {
      query.andWhere('property.state = :state', {
        state: filters.state,
      });
    }

    if (filters.city) {
      query.andWhere('property.city = :city', {
        city: filters.city,
      });
    }

    if (filters.minPrice) {
      query.andWhere('property.price >= :minPrice', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice) {
      query.andWhere('property.price <= :maxPrice', {
        maxPrice: filters.maxPrice,
      });
    }

    return await query.getMany();
  }
}

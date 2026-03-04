import { Injectable } from '@nestjs/common';
import { IsNull } from 'typeorm';
import { PropertyRepository } from '../../domain/property.repository';
import { PropertyOperationType } from '../../../../shared/enums/property-operation-type.enum';
import { PropertyStatus } from '../../../../shared/enums/property-status.enum';

@Injectable()
export class CountPropertiesUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async countSale(): Promise<number> {
    return await this.propertyRepository.count({
      where: { operationType: PropertyOperationType.SALE, deletedAt: IsNull() },
    });
  }

  async countPublished(): Promise<number> {
    return await this.propertyRepository.count({
      where: { status: PropertyStatus.PUBLISHED, deletedAt: IsNull() },
    });
  }

  async countFeatured(): Promise<number> {
    return await this.propertyRepository.count({
      where: { isFeatured: true, deletedAt: IsNull() },
    });
  }
}

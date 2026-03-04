import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class FindAllPropertyTypesWithFeaturesUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(): Promise<any[]> {
    const types = await this.repo.find({
      select: [
        'id',
        'name',
        'hasBedrooms',
        'hasBathrooms',
        'hasParkingSpaces',
      ],
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return types as any;
  }
}

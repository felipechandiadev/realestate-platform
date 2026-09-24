import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';

@Injectable()
export class UpdatePropertyTypeFeaturesUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string, features: Partial<any>) {
    const propertyType = await this.repo.findOne({ where: { id, deletedAt: null } });
    if (!propertyType) {
      throw new NotFoundException('Tipo de propiedad no encontrado');
    }

    Object.assign(propertyType, features);
    return await this.repo.save(propertyType);
  }
}

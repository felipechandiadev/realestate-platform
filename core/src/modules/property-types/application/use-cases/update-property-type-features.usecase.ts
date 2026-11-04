import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { pickFeatures } from '../property-type-name';

@Injectable()
export class UpdatePropertyTypeFeaturesUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string, features: Partial<any>) {
    const propertyType = await this.repo.findOne({ where: { id } });
    if (!propertyType) {
      throw new NotFoundException('Tipo de propiedad no encontrado');
    }

    // Solo las características: nombre, id y borrado no se tocan por esta vía.
    Object.assign(propertyType, pickFeatures(features));
    return await this.repo.save(propertyType);
  }
}

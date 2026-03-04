import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class UpdatePropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string, patch: Partial<any>) {
    const propertyType = await this.repo.findOne({ where: { id, deletedAt: null } });
    if (!propertyType) {
      throw new NotFoundException('Tipo de propiedad no encontrado');
    }

    if (patch.name && patch.name !== propertyType.name) {
      const existing = await this.repo.find({
        where: { name: patch.name, deletedAt: IsNull() },
      });
      if (existing && existing.length) {
        throw new ConflictException('El nombre del tipo de propiedad ya existe');
      }
    }

    await this.repo.update(id, patch);
    return await this.repo.findOne({ where: { id } });
  }
}

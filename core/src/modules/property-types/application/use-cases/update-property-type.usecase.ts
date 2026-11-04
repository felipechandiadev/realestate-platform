import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { PropertyType } from '../../domain/property-type.entity';
import {
  duplicateNameError,
  freeDeletedName,
  isDuplicateKeyError,
  normalizeDescription,
  normalizeTypeName,
  pickFeatures,
} from '../property-type-name';

@Injectable()
export class UpdatePropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string, patch: Partial<PropertyType>) {
    const propertyType = await this.repo.findOne({ where: { id } });
    if (!propertyType) {
      throw new NotFoundException('Tipo de propiedad no encontrado');
    }

    // Solo se cambian estos campos; id, fechas y borrado se ignoran.
    const clean: Partial<PropertyType> = { ...pickFeatures(patch as any) };

    if (patch.name !== undefined) {
      const name = normalizeTypeName(patch.name);
      if (name !== propertyType.name) {
        await freeDeletedName(this.repo, name);
        const existing = await this.repo.find({ where: { name } });
        // Cambiar solo las mayúsculas del propio nombre no es un conflicto.
        if (existing.some((other) => other.id !== id)) throw duplicateNameError();
        clean.name = name;
      }
    }
    // Una descripción vacía la borra; si no se envía, se conserva.
    if (patch.description !== undefined) {
      clean.description = normalizeDescription(patch.description) as any;
    }

    if (Object.keys(clean).length > 0) {
      try {
        await this.repo.update(id, clean);
      } catch (err) {
        if (isDuplicateKeyError(err)) throw duplicateNameError();
        throw err;
      }
    }
    return await this.repo.findOne({ where: { id } });
  }
}

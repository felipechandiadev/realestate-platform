import { Injectable } from '@nestjs/common';
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
export class CreatePropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(data: Partial<PropertyType>): Promise<PropertyType> {
    const name = normalizeTypeName(data?.name);

    // Si el nombre lo tenía un tipo ya eliminado, se libera para poder reutilizarlo.
    await freeDeletedName(this.repo, name);

    const existing = await this.repo.find({ where: { name } });
    if (existing && existing.length) throw duplicateNameError();

    const pt = this.repo.create({
      name,
      description: normalizeDescription(data?.description) as any,
      ...pickFeatures(data as any),
    });
    try {
      return await this.repo.save(pt);
    } catch (err) {
      // Dos personas creando el mismo nombre a la vez: la base lo rechaza.
      if (isDuplicateKeyError(err)) throw duplicateNameError();
      throw err;
    }
  }
}

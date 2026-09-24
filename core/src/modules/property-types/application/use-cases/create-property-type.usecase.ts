import { Injectable, ConflictException } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { PropertyType } from '../../domain/property-type.entity';

@Injectable()
export class CreatePropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(data: PropertyType): Promise<PropertyType> {
    // check uniqueness for name
    const existing = await this.repo.find({
      where: { name: data.name },
    });
    if (existing && existing.length) {
      throw new ConflictException('El nombre del tipo de propiedad ya existe');
    }

    const pt = this.repo.create(data as any);
    return await this.repo.save(pt as any);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';

@Injectable()
export class FindOnePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<Property> {
    const prop = await this.propertyRepository.findOne({ where: { id } });
    if (!prop) {
      throw new NotFoundException(`Property ${id} not found`);
    }
    return prop;
  }
}

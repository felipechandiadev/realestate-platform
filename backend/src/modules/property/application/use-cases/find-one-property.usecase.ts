import { Injectable, NotFoundException } from '@nestjs/common';
import { Property } from '../../domain/property.entity';
import { PropertyRepository } from '../../domain/property.repository';

@Injectable()
export class FindOnePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<Property> {
    const prop = await this.propertyRepository
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.assignedAgent', 'agent')
      .leftJoinAndSelect('property.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .leftJoinAndSelect('property.propertyType', 'propertyType')
      .where('property.id = :id', { id })
      .getOne();

    if (!prop) {
      throw new NotFoundException(`Property ${id} not found`);
    }
    return prop;
  }
}

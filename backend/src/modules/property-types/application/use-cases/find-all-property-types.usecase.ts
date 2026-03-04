import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { IsNull, Like } from 'typeorm';
import { PropertyType } from '../../domain/property-type.entity';

@Injectable()
export class FindAllPropertyTypesUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(search?: string): Promise<PropertyType[]> {
    const where: any = { deletedAt: IsNull() };
    
    if (search?.trim()) {
      where.name = Like(`%${search.trim()}%`);
    }

    return this.repo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';

@Injectable()
export class FindPropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string) {
    return this.repo.findOne({
      where: { id, deletedAt: null },
    });
  }
}

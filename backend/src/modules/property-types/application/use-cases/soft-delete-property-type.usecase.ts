import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';

@Injectable()
export class SoftDeletePropertyTypeUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(id: string) {
    await this.repo.softDelete(id);
  }
}

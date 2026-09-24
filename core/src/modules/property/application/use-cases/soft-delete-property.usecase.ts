import { Injectable } from '@nestjs/common';
import { PropertyRepository } from '../../domain/property.repository';

@Injectable()
export class SoftDeletePropertyUseCase {
  constructor(private readonly propertyRepository: PropertyRepository) {}

  async execute(id: string): Promise<void> {
    await this.propertyRepository.softDelete(id);
  }
}

import { Injectable } from '@nestjs/common';
import { PropertyTypeRepository } from '../../domain/property-type.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class FindAllPropertyTypesMinimalUseCase {
  constructor(private readonly repo: PropertyTypeRepository) {}

  async execute(): Promise<{ id: string; name: string }[]> {
    const types = await this.repo.find({
      select: ['id', 'name'],
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
    return types as any;
  }
}

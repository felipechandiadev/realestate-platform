import { Injectable } from '@nestjs/common';
import { IdentityRepository } from '../../domain/identity.repository';
import { Identity } from '../../domain/identity.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class FindAllIdentitiesUseCase {
  constructor(private readonly repo: IdentityRepository) {}

  async execute(): Promise<Identity[]> {
    return this.repo.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }
}

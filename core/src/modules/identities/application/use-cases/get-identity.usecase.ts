import { Injectable, NotFoundException } from '@nestjs/common';
import { IdentityRepository } from '../../domain/identity.repository';
import { Identity } from '../../domain/identity.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class GetIdentityUseCase {
  constructor(private readonly repo: IdentityRepository) {}

  async execute(id: string): Promise<Identity> {
    const item = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Identidad corporativa no encontrada.');
    return item;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { IdentityRepository } from '../../domain/identity.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class SoftDeleteIdentityUseCase {
  constructor(private readonly repo: IdentityRepository) {}

  async execute(id: string): Promise<void> {
    const item = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Identidad corporativa no encontrada.');
    await this.repo.softDelete(id);
  }
}

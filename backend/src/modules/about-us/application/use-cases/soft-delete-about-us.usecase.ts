import { Injectable } from '@nestjs/common';
import { AboutUsRepository } from '../../domain/about-us.repository';

@Injectable()
export class SoftDeleteAboutUsUseCase {
  constructor(private readonly repo: AboutUsRepository) {}

  async execute(): Promise<void> {
    const existing = await this.repo.findOne({ where: { deletedAt: null } });
    if (!existing) {
      return;
    }
    // use softDelete by id defined in repository
    await this.repo.softDelete(existing.id);
  }
}

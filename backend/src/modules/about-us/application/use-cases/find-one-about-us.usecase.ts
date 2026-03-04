import { Injectable, NotFoundException } from '@nestjs/common';
import { AboutUs } from '../../domain/about-us.entity';
import { AboutUsRepository } from '../../domain/about-us.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class FindOneAboutUsUseCase {
  constructor(private readonly repo: AboutUsRepository) {}

  async execute(): Promise<AboutUs> {
    let aboutUs = await this.repo.findOne({ where: { deletedAt: IsNull() } });
    if (!aboutUs) {
      aboutUs = this.repo.create({ bio: '', mision: '', vision: '' } as any);
      await this.repo.save(aboutUs);
    }
    return aboutUs;
  }
}

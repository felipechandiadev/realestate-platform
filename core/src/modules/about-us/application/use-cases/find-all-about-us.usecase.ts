import { Injectable } from '@nestjs/common';
import { AboutUs } from '../../domain/about-us.entity';
import { AboutUsRepository } from '../../domain/about-us.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class FindAllAboutUsUseCase {
  constructor(private readonly repo: AboutUsRepository) {}

  execute(): Promise<AboutUs[]> {
    return this.repo.find({ where: { deletedAt: IsNull() }, order: { createdAt: 'DESC' } });
  }
}

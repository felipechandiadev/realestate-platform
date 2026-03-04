import { Injectable } from '@nestjs/common';
import { AboutUs } from '../../domain/about-us.entity';
import { AboutUsRepository } from '../../domain/about-us.repository';

@Injectable()
export class CreateAboutUsUseCase {
  constructor(private readonly repo: AboutUsRepository) {}

  execute(data: Partial<AboutUs>): AboutUs {
    const entity = this.repo.create(data);
    return entity;
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { AboutUs } from '../domain/about-us.entity';
import { AboutUsRepository } from '../domain/about-us.repository';

@Injectable()
export class TypeormAboutUsRepository extends AboutUsRepository {
  constructor(
    @InjectRepository(AboutUs)
    private readonly repo: Repository<AboutUs>,
  ) {
    super();
  }

  create(data: Partial<AboutUs>): AboutUs {
    return this.repo.create(data);
  }

  save(item: AboutUs): Promise<AboutUs> {
    return this.repo.save(item);
  }

  find(options?: any): Promise<AboutUs[]> {
    return this.repo.find(options);
  }

  findOne(options?: any): Promise<AboutUs | null> {
    return this.repo.findOne(options);
  }

  softDelete(id: string): Promise<void> {
    return this.repo.softDelete(id).then(() => {});
  }
}

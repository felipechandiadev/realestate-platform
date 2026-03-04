import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { SlideRepository } from '../domain/slide.repository';
import { Slide } from '../domain/slide.entity';

@Injectable()
export class TypeormSlideRepository extends SlideRepository {
  constructor(
    @InjectRepository(Slide)
    private readonly repository: Repository<Slide>,
  ) {
    super();
  }

  get manager() {
    return this.repository.manager as DataSource['manager'];
  }

  create(data: Partial<Slide>): Slide {
    // TypeORM's Repository.create may return Slide or Slide[] depending on input
    // cast through unknown to satisfy TypeScript
    return (this.repository.create(data as any) as unknown) as Slide;
  }

  async save(slide: Slide): Promise<Slide> {
    return this.repository.save(slide as any);
  }

  async find(options?: any): Promise<Slide[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Slide | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<Slide>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}

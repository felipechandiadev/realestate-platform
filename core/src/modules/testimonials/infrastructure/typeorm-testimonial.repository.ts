import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TestimonialRepository } from '../domain/testimonial.repository';
import { Testimonial } from '../domain/testimonial.entity';

@Injectable()
export class TypeormTestimonialRepository extends TestimonialRepository {
  constructor(
    @InjectRepository(Testimonial)
    private readonly repository: Repository<Testimonial>,
  ) {
    super();
  }

  create(data: Partial<Testimonial>): Testimonial {
    return (this.repository.create(data as any) as unknown) as Testimonial;
  }

  async save(testimonial: Testimonial): Promise<Testimonial> {
    return this.repository.save(testimonial as any);
  }

  async find(options?: any): Promise<Testimonial[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Testimonial | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<Testimonial>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}

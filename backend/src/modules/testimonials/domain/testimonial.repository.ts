import { SelectQueryBuilder } from 'typeorm';
import { Testimonial } from '../domain/testimonial.entity';

export abstract class TestimonialRepository {
  abstract create(data: Partial<Testimonial>): Testimonial;
  abstract save(testimonial: Testimonial): Promise<Testimonial>;
  abstract find(options?: any): Promise<Testimonial[]>;
  abstract findOne(options?: any): Promise<Testimonial | null>;
  abstract update(id: string, patch: Partial<Testimonial>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<Testimonial>;
}

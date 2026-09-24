import { Injectable } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { Testimonial } from '../../domain/testimonial.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class ListPublicTestimonialsUseCase {
  constructor(private readonly repo: TestimonialRepository) {}

  async execute(): Promise<Testimonial[]> {
    return this.repo
      .createQueryBuilder('testimonial')
      .where('testimonial.isActive = :isActive', { isActive: true })
      .andWhere('testimonial.deletedAt IS NULL')
      .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .orderBy('testimonial.createdAt', 'DESC')
      .getMany();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { Testimonial } from '../../domain/testimonial.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class GetTestimonialUseCase {
  constructor(private readonly repo: TestimonialRepository) {}

  async execute(id: string): Promise<Testimonial> {
    const item = await this.repo
      .createQueryBuilder('testimonial')
      .where('testimonial.id = :id', { id })
      .andWhere('testimonial.deletedAt IS NULL')
      .leftJoinAndSelect('testimonial.multimedia', 'multimedia')
      .leftJoinAndSelect('multimedia.variants', 'variants')
      .getOne();
    if (!item) throw new NotFoundException('Testimonio no encontrado.');
    return item;
  }
}

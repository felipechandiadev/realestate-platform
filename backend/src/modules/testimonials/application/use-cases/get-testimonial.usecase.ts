import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { Testimonial } from '../../domain/testimonial.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class GetTestimonialUseCase {
  constructor(private readonly repo: TestimonialRepository) {}

  async execute(id: string): Promise<Testimonial> {
    const item = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!item) throw new NotFoundException('Testimonio no encontrado.');
    return item;
  }
}

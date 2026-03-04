import { Injectable } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { Testimonial } from '../../domain/testimonial.entity';
import { IsNull } from 'typeorm';

@Injectable()
export class ListPublicTestimonialsUseCase {
  constructor(private readonly repo: TestimonialRepository) {}

  async execute(): Promise<Testimonial[]> {
    return this.repo.find({
      where: { isActive: true, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }
}

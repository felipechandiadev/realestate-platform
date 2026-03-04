import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { IsNull } from 'typeorm';

@Injectable()
export class SoftDeleteTestimonialUseCase {
  constructor(private readonly repo: TestimonialRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!existing) throw new NotFoundException('Testimonio no encontrado.');
    await this.repo.softDelete(id);
  }
}

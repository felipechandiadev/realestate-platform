import { Injectable, NotFoundException } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';

@Injectable()
export class SoftDeleteSlideUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(id: string): Promise<void> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Slide not found');
    await this.slideRepo.softDelete(id);
  }
}

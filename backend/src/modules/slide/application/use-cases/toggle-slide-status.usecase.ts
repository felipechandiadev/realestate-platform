import { Injectable, NotFoundException } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';

@Injectable()
export class ToggleSlideStatusUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(id: string): Promise<Slide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Slide not found');
    slide.isActive = !slide.isActive;
    return this.slideRepo.save(slide);
  }
}

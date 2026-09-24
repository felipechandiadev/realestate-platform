import { Injectable, NotFoundException } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';

@Injectable()
export class GetSlideUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(id: string): Promise<Slide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException(`Slide with ID ${id} not found`);
    return slide;
  }
}

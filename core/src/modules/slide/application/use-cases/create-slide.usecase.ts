import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';
import { normalizeSlideInput } from '../../slide-presentation';

@Injectable()
export class CreateSlideUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(data: Partial<Slide>): Promise<Slide> {
    normalizeSlideInput(data as Record<string, unknown>);
    const slide = this.slideRepo.create(data);
    return this.slideRepo.save(slide);
  }
}

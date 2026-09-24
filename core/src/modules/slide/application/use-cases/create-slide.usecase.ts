import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';

@Injectable()
export class CreateSlideUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(data: Partial<Slide>): Promise<Slide> {
    const slide = this.slideRepo.create(data);
    return this.slideRepo.save(slide);
  }
}

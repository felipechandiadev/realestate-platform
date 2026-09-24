import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';

@Injectable()
export class ReorderSlidesUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(slideIds: string[]): Promise<void> {
    for (let i = 0; i < slideIds.length; i++) {
      await this.slideRepo.update(slideIds[i], { order: i + 1 });
    }
  }
}

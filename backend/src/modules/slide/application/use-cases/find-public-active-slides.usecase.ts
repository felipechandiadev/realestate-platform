import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';

@Injectable()
export class FindPublicActiveSlidesUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(): Promise<Slide[]> {
    const currentDate = new Date();
    return this.slideRepo
      .createQueryBuilder('slide')
      .where('slide.deletedAt IS NULL')
      .andWhere('slide.isActive = :isActive', { isActive: true })
      .andWhere('(slide.startDate IS NULL OR slide.startDate <= :currentDate)', { currentDate })
      .andWhere('(slide.endDate IS NULL OR slide.endDate >= :currentDate)', { currentDate })
      .orderBy('slide.order', 'ASC')
      .getMany();
  }
}

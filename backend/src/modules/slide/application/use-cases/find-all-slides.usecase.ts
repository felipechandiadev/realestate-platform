import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';

@Injectable()
export class FindAllSlidesUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(search?: string): Promise<Slide[]> {
    const qb = this.slideRepo
      .createQueryBuilder('slide')
      .where('slide.deletedAt IS NULL');

    if (search) {
      qb.andWhere(
        '(slide.title LIKE :search OR slide.description LIKE :search)',
        { search: `%${search}%` },
      );
    }

    return qb.orderBy('slide.order', 'ASC').addOrderBy('slide.createdAt', 'DESC').getMany();
  }
}

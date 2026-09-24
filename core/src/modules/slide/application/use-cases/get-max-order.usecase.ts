import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';

@Injectable()
export class GetMaxOrderUseCase {
  constructor(private readonly slideRepo: SlideRepository) {}

  async execute(): Promise<number> {
    const result: any = await this.slideRepo
      .createQueryBuilder('slide')
      .select('MAX(slide.order)', 'maxOrder')
      .getRawOne();
    return result?.maxOrder || 0;
  }
}

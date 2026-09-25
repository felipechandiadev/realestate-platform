import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Identity } from '../../../identities/domain/identity.entity';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';
import { clampHeroAutoplaySeconds } from '../../slide-presentation';

export interface PublicActiveSlides {
  slides: Slide[];
  autoplaySeconds: number;
}

@Injectable()
export class FindPublicActiveSlidesUseCase {
  constructor(
    private readonly slideRepo: SlideRepository,
    @InjectRepository(Identity)
    private readonly identityRepo: Repository<Identity>,
  ) {}

  async execute(): Promise<PublicActiveSlides> {
    const currentDate = new Date();
    const slides = await this.slideRepo
      .createQueryBuilder('slide')
      .where('slide.deletedAt IS NULL')
      .andWhere('slide.isActive = :isActive', { isActive: true })
      .andWhere('(slide.startDate IS NULL OR slide.startDate <= :currentDate)', { currentDate })
      .andWhere('(slide.endDate IS NULL OR slide.endDate >= :currentDate)', { currentDate })
      .orderBy('slide.order', 'ASC')
      .getMany();

    const identity = await this.identityRepo.findOne({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    return {
      slides,
      autoplaySeconds: clampHeroAutoplaySeconds(identity?.heroAutoplaySeconds ?? 6),
    };
  }
}

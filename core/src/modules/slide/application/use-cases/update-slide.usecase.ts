import { Injectable, NotFoundException } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';
import { StaticFilesService } from '../../../multimedia/infrastructure/storage/static-files.service';
import { normalizeSlideInput } from '../../slide-presentation';

@Injectable()
export class UpdateSlideUseCase {
  constructor(
    private readonly slideRepo: SlideRepository,
    private readonly staticFilesService: StaticFilesService,
  ) {}

  async execute(id: string, updateData: any): Promise<Slide> {
    const slide = await this.slideRepo.findOne({ where: { id } });
    if (!slide) throw new NotFoundException('Slide not found');

    normalizeSlideInput(updateData);

    if (updateData.multimediaUrl && !updateData.multimediaUrl.startsWith('http')) {
      updateData.multimediaUrl = this.staticFilesService.getPublicUrl(
        updateData.multimediaUrl.replace(/^\/public\//, ''),
      );
    }

    Object.assign(slide, updateData);
    return this.slideRepo.save(slide);
  }
}

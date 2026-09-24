import { Injectable, NotFoundException } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { StaticFilesService } from '../../../multimedia/infrastructure/storage/static-files.service';

@Injectable()
export class UpdateSlideWithMultimediaUseCase {
  constructor(
    private readonly slideRepo: SlideRepository,
    private readonly multimediaService: MultimediaService,
    private readonly staticFilesService: StaticFilesService,
  ) {}

  async execute(
    id: string,
    updateSlideDto: any,
    file?: Express.Multer.File,
  ): Promise<Slide> {
    const existingSlide = await this.slideRepo.findOne({ where: { id } });
    if (!existingSlide) {
      throw new NotFoundException('Slide not found');
    }

    let newMultimediaUrl = existingSlide.multimediaUrl;

    if (file) {
      if (existingSlide.multimediaUrl) {
        try {
          await this.multimediaService.deleteFileByUrl(existingSlide.multimediaUrl);
        } catch {
          // ignore
        }
      }
      newMultimediaUrl = await this.multimediaService.uploadFileToPath(file, 'web/slides');
    }

    if (updateSlideDto.multimediaUrl && !updateSlideDto.multimediaUrl.startsWith('http')) {
      updateSlideDto.multimediaUrl = this.staticFilesService.getPublicUrl(
        updateSlideDto.multimediaUrl.replace(/^\/public\//, ''),
      );
    }

    Object.assign(existingSlide, updateSlideDto);
    existingSlide.multimediaUrl = newMultimediaUrl;

    return this.slideRepo.save(existingSlide);
  }
}

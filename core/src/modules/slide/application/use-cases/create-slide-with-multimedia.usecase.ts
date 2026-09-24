import { Injectable } from '@nestjs/common';
import { SlideRepository } from '../../domain/slide.repository';
import { Slide } from '../../domain/slide.entity';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';

@Injectable()
export class CreateSlideWithMultimediaUseCase {
  constructor(
    private readonly slideRepo: SlideRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(
    createSlideDto: any,
    file?: Express.Multer.File,
  ): Promise<Slide> {
    // replicating service logic for order and multimedia upload
    const maxOrder = await this.getMaxOrder();
    const nextOrder = maxOrder + 1;
    let multimediaUrl: string | undefined;
    if (file) {
      multimediaUrl = await this.multimediaService.uploadFileToPath(file, 'web/slides');
    }
    const slideData: Partial<Slide> = {
      title: createSlideDto.title,
      description: createSlideDto.description || '',
      multimediaUrl: multimediaUrl || undefined,
      linkUrl: createSlideDto.linkUrl || undefined,
      duration: createSlideDto.duration || 3,
      startDate: createSlideDto.startDate ? new Date(createSlideDto.startDate) : undefined,
      endDate: createSlideDto.endDate ? new Date(createSlideDto.endDate) : undefined,
      order: nextOrder,
      isActive: createSlideDto.isActive !== false,
    };
    const slide = this.slideRepo.create(slideData);
    return this.slideRepo.save(slide);
  }

  private async getMaxOrder(): Promise<number> {
    const result: any = await this.slideRepo
      .createQueryBuilder('slide')
      .select('MAX(slide.order)', 'maxOrder')
      .getRawOne();
    return result?.maxOrder || 0;
  }
}

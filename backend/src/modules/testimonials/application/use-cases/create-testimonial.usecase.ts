import { Injectable, ConflictException } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { Testimonial } from '../../domain/testimonial.entity';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { MultimediaType } from '../../../multimedia/domain/multimedia.entity';

@Injectable()
export class CreateTestimonialUseCase {
  constructor(
    private readonly repo: TestimonialRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(dto: any, file?: Express.Multer.File): Promise<Testimonial> {
    let imageUrl: string | undefined;
    if (file) {
      try {
        const multimedia = await this.multimediaService.uploadFile(file, { type: MultimediaType.TESTIMONIAL_IMG }, undefined);
        imageUrl = multimedia.url;
      } catch (err) {
        throw err;
      }
    }
    const createData = { ...dto };
    // Support legacy `text` field used in tests by mapping it to `content`
    if (!createData.content && createData.text) {
      createData.content = createData.text;
    }
    if ('isActive' in createData) {
      createData.isActive = !!createData.isActive;
    }
    const testimonial = this.repo.create({
      ...createData,
      imageUrl,
      isActive: createData.isActive ?? true,
    });
    return this.repo.save(testimonial);
  }
}

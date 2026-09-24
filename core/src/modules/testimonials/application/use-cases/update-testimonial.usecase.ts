import { Injectable, NotFoundException } from '@nestjs/common';
import { TestimonialRepository } from '../../domain/testimonial.repository';
import { Testimonial } from '../../domain/testimonial.entity';
import { IsNull } from 'typeorm';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { MultimediaType } from '../../../multimedia/domain/multimedia.entity';

@Injectable()
export class UpdateTestimonialUseCase {
  constructor(
    private readonly repo: TestimonialRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(
    id: string,
    dto: any,
    file?: Express.Multer.File,
  ): Promise<Testimonial> {
    const existing = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!existing) throw new NotFoundException('Testimonio no encontrado.');

    let imageUrl: string | undefined;
    if (file) {
      try {
        const multimedia = await this.multimediaService.uploadFile(file, { type: MultimediaType.TESTIMONIAL_IMG }, undefined);
        imageUrl = multimedia.url;
      } catch (err) {
        throw err;
      }
    }

    const updateData: any = { ...dto };

    // Map legacy `text` field to `content` for backward compatibility
    if (updateData.text && !updateData.content) {
      updateData.content = updateData.text;
    }

    if ('isActive' in updateData) {
      updateData.isActive = !!updateData.isActive;
    }

    Object.assign(existing, {
      ...updateData,
      ...(imageUrl && { imageUrl }),
    });

    return this.repo.save(existing);
  }
}

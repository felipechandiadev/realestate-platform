import { Injectable } from '@nestjs/common';
import { AboutUs } from '../../domain/about-us.entity';
import { UpdateAboutUsDto } from '../../dto/about-us.dto';
import { AboutUsRepository } from '../../domain/about-us.repository';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { IsNull } from 'typeorm';

@Injectable()
export class UpdateAboutUsUseCase {
  constructor(
    private readonly repo: AboutUsRepository,
    private readonly multimediaService: MultimediaService,
  ) {}

  async execute(dto: UpdateAboutUsDto, file?: Express.Multer.File): Promise<AboutUs> {
    const aboutUs = await this.repo.findOne({ where: { deletedAt: IsNull() } });
    if (!aboutUs) {
      throw new Error('No about-us record');
    }

    if (file) {
      dto.multimediaUrl = await this.multimediaService.uploadFileToPath(file, 'web/aboutUs');
    }

    Object.assign(aboutUs, dto as any);
    return this.repo.save(aboutUs);
  }
}


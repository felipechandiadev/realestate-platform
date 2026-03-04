import { Injectable, NotFoundException } from '@nestjs/common';
import { IdentityRepository } from '../../domain/identity.repository';
import { Identity } from '../../domain/identity.entity';
import { IsNull } from 'typeorm';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { StaticFilesService } from '../../../multimedia/infrastructure/storage/static-files.service';
import { MultimediaType } from '../../../multimedia/domain/multimedia.entity';

@Injectable()
export class UpdateIdentityUseCase {
  constructor(
    private readonly repo: IdentityRepository,
    private readonly multimediaService: MultimediaService,
    private readonly staticFilesService: StaticFilesService,
  ) {}

  async execute(
    id: string,
    dto: any,
    files?: { logo?: Express.Multer.File[]; partnershipLogos?: Express.Multer.File[] },
  ): Promise<Identity> {
    const identity = await this.repo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!identity) throw new NotFoundException('Identidad corporativa no encontrada.');

    if (files?.logo?.[0]) {
      const logoFile = files.logo[0];
      dto.urlLogo = await this.multimediaService.uploadFileToPath(logoFile, 'web/logos');
    }

    if (files?.partnershipLogos && dto.partnerships) {
      for (let i = 0; i < dto.partnerships.length; i++) {
        const partnership = dto.partnerships[i];
        const logoFile = files.partnershipLogos[i];
        if (logoFile) {
          partnership.logoUrl = await this.multimediaService.uploadFileToPath(logoFile, 'web/partnerships');
        }
      }
    }

    const updated = { ...identity, ...dto };
    return this.repo.save(updated as any);
  }
}
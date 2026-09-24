import { Injectable } from '@nestjs/common';
import { IdentityRepository } from '../../domain/identity.repository';
import { Identity } from '../../domain/identity.entity';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { StaticFilesService } from '../../../multimedia/infrastructure/storage/static-files.service';
import { MultimediaType } from '../../../multimedia/domain/multimedia.entity';

@Injectable()
export class CreateIdentityUseCase {
  constructor(
    private readonly repo: IdentityRepository,
    private readonly multimediaService: MultimediaService,
    private readonly staticFilesService: StaticFilesService,
  ) {}

  async execute(dto: any, files?: { logo?: Express.Multer.File[]; partnershipLogos?: Express.Multer.File[] }): Promise<Identity> {
    if (files?.logo?.[0]) {
      const logoFile = files.logo[0];
      dto.urlLogo = await this.multimediaService.uploadFileToPath(logoFile, 'web/logos');
    }

    if (files?.partnershipLogos && dto.partnerships) {
      for (let i = 0; i < dto.partnerships.length; i++) {
        const partnership = dto.partnerships[i];
        const logoFile = files.partnershipLogos[i];
        if (logoFile) {
          const partnershipPath = await this.multimediaService.uploadFileToPath(logoFile, 'web/partnerships');
          partnership.logoUrl = partnershipPath.startsWith('http') ? partnershipPath : this.staticFilesService.getPublicUrl(partnershipPath);
        }
      }
    }

    const identity = this.repo.create(dto);
    return this.repo.save(identity);
  }
}

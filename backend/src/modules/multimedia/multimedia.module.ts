import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MultimediaService } from './application/multimedia.service';
import { MultimediaController } from './presentation/multimedia.controller';
import { Multimedia } from './domain/multimedia.entity';
import { MultimediaUploadController } from './presentation/multimedia-upload.controller';
import { MultimediaStorageService } from './infrastructure/storage/multimedia-storage.service';
import { StaticFilesService } from './infrastructure/storage/static-files.service';
import { CloudflareStorageService } from './infrastructure/storage/cloudflare-storage.service';
import { AwsS3StorageService } from './infrastructure/storage/aws-s3-storage.service';
import { UploadConfigService } from '../../config/upload.config';
import { MultimediaVariant } from '../media-optimization/domain/multimedia-variant.entity';
// repository and use cases
import { TypeormMultimediaRepository } from './infrastructure/typeorm-multimedia.repository';
import { MultimediaRepository } from './domain/multimedia.repository';
import { CreateMultimediaUseCase } from './application/use-cases/create-multimedia.usecase';
import { FindAllMultimediaUseCase } from './application/use-cases/find-all-multimedia.usecase';
import { GetMultimediaUseCase } from './application/use-cases/get-multimedia.usecase';
import { UpdateMultimediaUseCase } from './application/use-cases/update-multimedia.usecase';
import { SoftDeleteMultimediaUseCase } from './application/use-cases/soft-delete-multimedia.usecase';
import { HardDeleteMultimediaUseCase } from './application/use-cases/hard-delete-multimedia.usecase';
import { GetUrlUseCase } from './application/use-cases/get-url.usecase';
import { SetSeoTitleUseCase } from './application/use-cases/set-seo-title.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([Multimedia, MultimediaVariant]), ConfigModule],
  controllers: [MultimediaController, MultimediaUploadController],
  providers: [
    MultimediaService,
    MultimediaStorageService,
    StaticFilesService,
    CloudflareStorageService,
    AwsS3StorageService,
    UploadConfigService,
    {
      provide: MultimediaRepository,
      useClass: TypeormMultimediaRepository,
    },
    CreateMultimediaUseCase,
    FindAllMultimediaUseCase,
    GetMultimediaUseCase,
    UpdateMultimediaUseCase,
    SoftDeleteMultimediaUseCase,
    HardDeleteMultimediaUseCase,
    GetUrlUseCase,
    SetSeoTitleUseCase,
  ],
  exports: [
    MultimediaService,
    MultimediaStorageService,
    StaticFilesService,
    CloudflareStorageService,
    AwsS3StorageService,
    UploadConfigService,
  ],
})
export class MultimediaModule {}

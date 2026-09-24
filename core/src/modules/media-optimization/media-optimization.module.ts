import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MultimediaVariant } from './domain/multimedia-variant.entity';
import { Multimedia } from '../multimedia/domain/multimedia.entity';
import {
  SharpProcessorService,
  R2StorageService,
  ImageOptimizationService,
} from './application/services';
import { R2Config } from './infrastructure/config/r2.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Multimedia, MultimediaVariant]),
  ],
  providers: [
    R2Config,
    SharpProcessorService,
    R2StorageService,
    ImageOptimizationService,
  ],
  exports: [ImageOptimizationService, R2StorageService],
})
export class MediaOptimizationModule {}

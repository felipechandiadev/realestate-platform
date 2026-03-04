import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlideService } from './application/slide.service';
import { SlideController } from './presentation/slide.controller';
import { Slide } from './domain/slide.entity';
import { Multimedia } from '../multimedia/domain/multimedia.entity';
import { AuthModule } from '../auth/auth.module';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { SlideRepository } from './domain/slide.repository';
import { TypeormSlideRepository } from './infrastructure/typeorm-slide.repository';
import { CreateSlideUseCase } from './application/use-cases/create-slide.usecase';
import { CreateSlideWithMultimediaUseCase } from './application/use-cases/create-slide-with-multimedia.usecase';
import { FindAllSlidesUseCase } from './application/use-cases/find-all-slides.usecase';
import { FindActiveSlidesUseCase } from './application/use-cases/find-active-slides.usecase';
import { FindPublicActiveSlidesUseCase } from './application/use-cases/find-public-active-slides.usecase';
import { GetSlideUseCase } from './application/use-cases/get-slide.usecase';
import { UpdateSlideUseCase } from './application/use-cases/update-slide.usecase';
import { SoftDeleteSlideUseCase } from './application/use-cases/soft-delete-slide.usecase';
import { ToggleSlideStatusUseCase } from './application/use-cases/toggle-slide-status.usecase';
import { ReorderSlidesUseCase } from './application/use-cases/reorder-slides.usecase';
import { GetMaxOrderUseCase } from './application/use-cases/get-max-order.usecase';
import { UpdateSlideWithMultimediaUseCase } from './application/use-cases/update-slide-with-multimedia.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Slide, Multimedia]),
    AuthModule,
    MultimediaModule
  ],
  controllers: [SlideController],
  providers: [
    SlideService,
    TypeormSlideRepository,
    {
      provide: SlideRepository,
      useExisting: TypeormSlideRepository,
    },
    CreateSlideUseCase,
    CreateSlideWithMultimediaUseCase,
    FindAllSlidesUseCase,
    FindActiveSlidesUseCase,
    FindPublicActiveSlidesUseCase,
    GetSlideUseCase,
    UpdateSlideUseCase,
    SoftDeleteSlideUseCase,
    ToggleSlideStatusUseCase,
    ReorderSlidesUseCase,
    GetMaxOrderUseCase,
    UpdateSlideWithMultimediaUseCase,
  ],
  exports: [SlideService],
})
export class SlideModule {}
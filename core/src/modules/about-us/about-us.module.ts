import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutUs } from './domain/about-us.entity';
import { AboutUsService } from './application/about-us.service';
import { AboutUsController } from './presentation/about-us.controller';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { AboutUsRepository } from './domain/about-us.repository';
import { TypeormAboutUsRepository } from './infrastructure/typeorm-about-us.repository';
import { CreateAboutUsUseCase } from './application/use-cases/create-about-us.usecase';
import { FindAllAboutUsUseCase } from './application/use-cases/find-all-about-us.usecase';
import { FindOneAboutUsUseCase } from './application/use-cases/find-one-about-us.usecase';
import { UpdateAboutUsUseCase } from './application/use-cases/update-about-us.usecase';
import { SoftDeleteAboutUsUseCase } from './application/use-cases/soft-delete-about-us.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([AboutUs]), MultimediaModule],
  controllers: [AboutUsController],
  providers: [
    TypeormAboutUsRepository,
    {
      provide: AboutUsRepository,
      useExisting: TypeormAboutUsRepository,
    },
    CreateAboutUsUseCase,
    FindAllAboutUsUseCase,
    FindOneAboutUsUseCase,
    UpdateAboutUsUseCase,
    SoftDeleteAboutUsUseCase,
    AboutUsService,
  ],
  exports: [AboutUsService],
})
export class AboutUsModule {}

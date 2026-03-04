import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './domain/property.entity';
import { PropertyController } from './presentation/property.controller';
import { PropertyService } from './application/property.service';
import { User } from '../users/domain/user.entity';
import { PropertyType } from '../property-types/domain/property-type.entity';
import { Multimedia } from '../multimedia/domain/multimedia.entity';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { ConfigModule } from '@nestjs/config';
import { FileUploadService } from '../../shared/services/file-upload.service';

// domain / infrastructure imports
import { PropertyRepository } from './domain/property.repository';
import { TypeormPropertyRepository } from './infrastructure/typeorm-property.repository';
// application use-cases
import { CreatePropertyUseCase } from './application/use-cases/create-property.usecase';
import { FindPropertiesUseCase } from './application/use-cases/find-properties.usecase';
import { FindOnePropertyUseCase } from './application/use-cases/find-one-property.usecase';
import { CountPropertiesUseCase } from './application/use-cases/count-properties.usecase';
import { ToggleFavoriteUseCase } from './application/use-cases/toggle-favorite.usecase';
import { IsFavoritedUseCase } from './application/use-cases/is-favorited.usecase';
import { GridSalePropertiesUseCase } from './application/use-cases/grid-sale-properties.usecase';
import { ExportSalePropertiesExcelUseCase } from './application/use-cases/export-sale-properties-excel.usecase';
import { ExportRentPropertiesExcelUseCase } from './application/use-cases/export-rent-properties-excel.usecase';
import { UpdatePropertyUseCase } from './application/use-cases/update-property.usecase';
import { GridRentPropertiesUseCase } from './application/use-cases/grid-rent-properties.usecase';
import { ListAvailableRentPropertiesUseCase } from './application/use-cases/list-available-rent-properties.usecase';
import { ListPublishedPublicUseCase } from './application/use-cases/list-published-public.usecase';
import { GetPublishedPropertiesFilteredUseCase } from './application/use-cases/get-published-properties-filtered.usecase';
import { FindPublishedFeaturedPublicUseCase } from './application/use-cases/find-published-featured-public.usecase';
import { FindPublishedFeaturedPublicPaginatedUseCase } from './application/use-cases/find-published-featured-public-paginated.usecase';
import { SoftDeletePropertyUseCase } from './application/use-cases/soft-delete-property.usecase';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Property, User, Multimedia, PropertyType]), AuditModule, NotificationsModule, MultimediaModule, AuthModule],
  controllers: [PropertyController],
  providers: [
    PropertyService,
    FileUploadService,
    {
      provide: PropertyRepository,
      useClass: TypeormPropertyRepository,
    },
    // use-case bindings
    CreatePropertyUseCase,
    FindPropertiesUseCase,
    FindOnePropertyUseCase,
    CountPropertiesUseCase,
    ToggleFavoriteUseCase,
    IsFavoritedUseCase,
    GridSalePropertiesUseCase,
    ExportSalePropertiesExcelUseCase,
    ExportRentPropertiesExcelUseCase,
    UpdatePropertyUseCase,
    GridRentPropertiesUseCase,
    ListAvailableRentPropertiesUseCase,
    // public listing use-cases
    ListPublishedPublicUseCase,
    FindPublishedFeaturedPublicUseCase,
    FindPublishedFeaturedPublicPaginatedUseCase,
    SoftDeletePropertyUseCase,
    GetPublishedPropertiesFilteredUseCase,
  ],
  exports: [PropertyService],
})
export class PropertyModule {}

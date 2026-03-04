import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyTypesService } from './application/property-types.service';
import { PropertyTypesController } from './presentation/property-types.controller';
import { PropertyType } from './domain/property-type.entity';
import { TypeormPropertyTypeRepository } from './infrastructure/typeorm-property-type.repository';
import { PropertyTypeRepository } from './domain/property-type.repository';
import { CreatePropertyTypeUseCase } from './application/use-cases/create-property-type.usecase';
import { FindAllPropertyTypesUseCase } from './application/use-cases/find-all-property-types.usecase';
import { FindAllPropertyTypesMinimalUseCase } from './application/use-cases/find-all-property-types-minimal.usecase';
import { FindAllPropertyTypesWithFeaturesUseCase } from './application/use-cases/find-all-property-types-with-features.usecase';
import { FindPropertyTypeUseCase } from './application/use-cases/find-property-type.usecase';
import { UpdatePropertyTypeUseCase } from './application/use-cases/update-property-type.usecase';
import { SoftDeletePropertyTypeUseCase } from './application/use-cases/soft-delete-property-type.usecase';
import { UpdatePropertyTypeFeaturesUseCase } from './application/use-cases/update-property-type-features.usecase';

@Module({
  imports: [TypeOrmModule.forFeature([PropertyType])],
  controllers: [PropertyTypesController],
  providers: [
    PropertyTypesService,
    {
      provide: PropertyTypeRepository,
      useClass: TypeormPropertyTypeRepository,
    },
    CreatePropertyTypeUseCase,
    FindAllPropertyTypesUseCase,
    FindAllPropertyTypesMinimalUseCase,
    FindAllPropertyTypesWithFeaturesUseCase,
    FindPropertyTypeUseCase,
    UpdatePropertyTypeUseCase,
    SoftDeletePropertyTypeUseCase,
    UpdatePropertyTypeFeaturesUseCase,
  ],
  exports: [PropertyTypesService],
})
export class PropertyTypesModule {}

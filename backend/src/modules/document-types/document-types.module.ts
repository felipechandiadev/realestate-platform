import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentTypesService } from './application/document-types.service';
import { DocumentTypesController } from './presentation/document-types.controller';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { DocumentModule } from '../document/document.module';
import { DocumentTypeRepository } from './domain/document-type.repository';
import { DocumentTypeOrmEntity } from './infrastructure/persistence/document-type.orm-entity';
import { TypeormDocumentTypeRepository } from './infrastructure/persistence/typeorm-document-type.repository';
import { CreateDocumentTypeUseCase } from './application/use-cases/create-document-type.usecase';
import { FindAllDocumentTypesUseCase } from './application/use-cases/find-all-document-types.usecase';
import { FindDocumentTypeUseCase } from './application/use-cases/find-document-type.usecase';
import { UpdateDocumentTypeUseCase } from './application/use-cases/update-document-type.usecase';
import { SoftDeleteDocumentTypeUseCase } from './application/use-cases/soft-delete-document-type.usecase';
import { SetAvailableDocumentTypeUseCase } from './application/use-cases/set-available-document-type.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentTypeOrmEntity]),
    MultimediaModule,
    forwardRef(() => DocumentModule),
  ],
  controllers: [DocumentTypesController],
  providers: [
    DocumentTypesService,
    CreateDocumentTypeUseCase,
    FindAllDocumentTypesUseCase,
    FindDocumentTypeUseCase,
    UpdateDocumentTypeUseCase,
    SoftDeleteDocumentTypeUseCase,
    SetAvailableDocumentTypeUseCase,
    TypeormDocumentTypeRepository,
    {
      provide: DocumentTypeRepository,
      useClass: TypeormDocumentTypeRepository,
    },
  ],
  exports: [DocumentTypesService, DocumentTypeRepository],
})
export class DocumentTypesModule {}

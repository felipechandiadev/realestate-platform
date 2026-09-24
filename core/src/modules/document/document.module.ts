import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './domain/document.entity';
import { DocumentType } from '../document-types/domain/document-type.entity';
import { DocumentTypeOrmEntity } from '../document-types/infrastructure/persistence/document-type.orm-entity';
import { User } from '../users/domain/user.entity';
import { Person } from '../person/domain/person.entity';
import { PersonOrmEntity } from '../person/infrastructure/persistence/person.orm-entity';
import { Multimedia } from '../multimedia/domain/multimedia.entity';
import { Payment } from '../contracts/domain/payment.entity';
import { ContractsModule } from '../contracts/contracts.module';
import { ContractRepository } from '../contracts/domain/contract.repository';
import { DocumentService } from './application/document.service';
import { DocumentController } from './presentation/document.controller';
import { TypeormDocumentRepository } from './infrastructure/typeorm-document.repository';
import { DocumentRepository } from './domain/document.repository';
import { CreateDocumentUseCase } from './application/use-cases/create-document.usecase';
import { FindAllDocumentsUseCase } from './application/use-cases/find-all-documents.usecase';
import { FindDocumentsByPersonUseCase } from './application/use-cases/find-documents-by-person.usecase';
import { FindDocumentsByContractUseCase } from './application/use-cases/find-documents-by-contract.usecase';
import { GetDocumentUseCase } from './application/use-cases/get-document.usecase';
import { UpdateDocumentUseCase } from './application/use-cases/update-document.usecase';
import { SoftDeleteDocumentUseCase } from './application/use-cases/soft-delete-document.usecase';
import { UploadDocumentUseCase } from './application/use-cases/upload-document.usecase';
import { UploadDniUseCase } from './application/use-cases/upload-dni.usecase';
import { MultimediaModule } from '../multimedia/multimedia.module';
import { AuthModule } from '../auth/auth.module';
import { JweAuthGuard } from '../auth/jwe/jwe-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentTypeOrmEntity, User, PersonOrmEntity, Multimedia, Payment]),
    forwardRef(() => ContractsModule),
    MultimediaModule,
    AuthModule,
  ],
  controllers: [DocumentController],
  providers: [
    TypeormDocumentRepository,
    {
      provide: DocumentRepository,
      useExisting: TypeormDocumentRepository,
    },
    // use-case providers
    CreateDocumentUseCase,
    FindAllDocumentsUseCase,
    FindDocumentsByPersonUseCase,
    FindDocumentsByContractUseCase,
    GetDocumentUseCase,
    UpdateDocumentUseCase,
    SoftDeleteDocumentUseCase,
    UploadDocumentUseCase,
    UploadDniUseCase,
    DocumentService,
    JweAuthGuard,
  ],
  exports: [DocumentService],
})
export class DocumentModule {}

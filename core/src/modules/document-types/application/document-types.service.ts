import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DocumentType } from '../domain/document-type.entity';
import {
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  UploadFileDto,
  UploadDocumentDto,
} from '../dto/document-type.dto';
import { MultimediaService } from '../../multimedia/application/multimedia.service';
import { DocumentService } from '../../document/application/document.service';
import { MultimediaType } from '../../multimedia/domain/multimedia.entity';
import { DocumentStatus } from '../../document/domain/document.entity';
import type { Express } from 'express';
import { CreateDocumentTypeUseCase } from './use-cases/create-document-type.usecase';
import { FindAllDocumentTypesUseCase } from './use-cases/find-all-document-types.usecase';
import { FindDocumentTypeUseCase } from './use-cases/find-document-type.usecase';
import { UpdateDocumentTypeUseCase } from './use-cases/update-document-type.usecase';
import { SoftDeleteDocumentTypeUseCase } from './use-cases/soft-delete-document-type.usecase';
import { SetAvailableDocumentTypeUseCase } from './use-cases/set-available-document-type.usecase';

@Injectable()
export class DocumentTypesService {
  constructor(
    private readonly multimediaService: MultimediaService,
    private readonly documentService: DocumentService,
    private readonly createDocumentType: CreateDocumentTypeUseCase,
    private readonly findAllDocumentTypes: FindAllDocumentTypesUseCase,
    private readonly findDocumentType: FindDocumentTypeUseCase,
    private readonly updateDocumentType: UpdateDocumentTypeUseCase,
    private readonly softDeleteDocumentType: SoftDeleteDocumentTypeUseCase,
    private readonly setAvailableDocumentType: SetAvailableDocumentTypeUseCase,
  ) {}

  async create(
    createDocumentTypeDto: CreateDocumentTypeDto,
  ): Promise<DocumentType> {
    // Check if name already exists
    // delegate to use-case
    const dt: DocumentType = {
      id: undefined as any,
      name: createDocumentTypeDto.name,
      description: createDocumentTypeDto.description ?? null,
      available: createDocumentTypeDto.available ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    try {
      return await this.createDocumentType.execute(dt);
    } catch (err) {
      throw new ConflictException(err.message);
    }
  }

  async findAll(): Promise<DocumentType[]> {
    return await this.findAllDocumentTypes.execute();
  }

  async findOne(id: string): Promise<DocumentType> {
    const documentType = await this.findDocumentType.execute(id);
    if (!documentType) {
      throw new NotFoundException('Tipo de documento no encontrado');
    }
    return documentType;
  }

  async update(
    id: string,
    updateDocumentTypeDto: UpdateDocumentTypeDto,
  ): Promise<DocumentType> {
    const patch: Partial<DocumentType> = { ...updateDocumentTypeDto } as any;
    try {
      return await this.updateDocumentType.execute(id, patch);
    } catch (err) {
      if (err.message.includes('encontrado')) {
        throw new NotFoundException(err.message);
      }
      throw new ConflictException(err.message);
    }
  }

  async softDelete(id: string): Promise<void> {
    await this.softDeleteDocumentType.execute(id);
  }

  async setAvailable(id: string, available: boolean): Promise<DocumentType> {
    return await this.setAvailableDocumentType.execute(id, available);
  }
  async uploadFile(
    file: Express.Multer.File,
    uploadFileDto: UploadFileDto,
  ): Promise<any> {
    // Subir el archivo usando el servicio de multimedia
    const multimediaMetadata = {
      type: MultimediaType.DOCUMENT,
      seoTitle: uploadFileDto.seoTitle || uploadFileDto.title,
      description: uploadFileDto.description,
    };

    const multimedia = await this.multimediaService.uploadFile(
      file,
      multimediaMetadata,
      uploadFileDto.uploadedById,
    );

    return multimedia;
  }

  async uploadDocument(
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
  ): Promise<any> {
    // Subir el archivo usando el servicio de multimedia
    const multimediaMetadata = {
      type: MultimediaType.DOCUMENT,
      seoTitle: uploadDocumentDto.seoTitle || uploadDocumentDto.title,
    };

    const multimedia = await this.multimediaService.uploadFile(
      file,
      multimediaMetadata,
      uploadDocumentDto.uploadedById,
    );

    // Crear el documento con la referencia al multimedia y estado UPLOADED
    const createDocumentDto: any = {
      title: uploadDocumentDto.title,
      documentTypeId: uploadDocumentDto.documentTypeId,
      multimediaId: multimedia.id,
      uploadedById: uploadDocumentDto.uploadedById,
      status: DocumentStatus.UPLOADED,
      notes: uploadDocumentDto.notes,
      required: uploadDocumentDto.required,
    };

    // Agregar paymentId si está presente
    if (uploadDocumentDto.paymentId) {
      createDocumentDto.paymentId = uploadDocumentDto.paymentId;
    }

    if (uploadDocumentDto.contractId) {
      createDocumentDto.contractId = uploadDocumentDto.contractId;
    }

    if (uploadDocumentDto.personId) {
      createDocumentDto.personId = uploadDocumentDto.personId;
    }

    const document = await this.documentService.create(createDocumentDto);

    return {
      document,
      multimedia,
    };
  }
}

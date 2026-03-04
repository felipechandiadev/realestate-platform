import { Injectable } from '@nestjs/common';
import type { Express } from 'express';
import { CreateDocumentDto, UploadDocumentDto } from '../../dto/document.dto';
import { MultimediaService } from '../../../multimedia/application/multimedia.service';
import { DocumentRepository } from '../../domain/document.repository';
import { Document } from '../../domain/document.entity';
import { MultimediaType } from '../../../multimedia/domain/multimedia.entity';

@Injectable()
export class UploadDocumentUseCase {
  constructor(
    private readonly multimediaService: MultimediaService,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(
    file: Express.Multer.File,
    uploadDto: UploadDocumentDto & { uploadedById: string },
  ): Promise<Document> {
    const multimediaMetadata = {
      type: MultimediaType.DOCUMENT,
      seoTitle: uploadDto.seoTitle || uploadDto.title,
    };

    const multimedia = await this.multimediaService.uploadFile(
      file,
      multimediaMetadata,
      uploadDto.uploadedById,
    );

    const createDocumentDto: CreateDocumentDto = {
      title: uploadDto.title,
      documentTypeId: uploadDto.documentTypeId,
      multimediaId: multimedia.id,
      uploadedById: uploadDto.uploadedById,
      personId: uploadDto.personId,
      contractId: uploadDto.contractId,
      paymentId: uploadDto.paymentId,
      status: uploadDto.status,
      notes: uploadDto.notes,
      required: uploadDto.required,
    };

    // delegate to create use-case via repository directly
    const doc = this.documentRepository.create({
      ...createDocumentDto as any,
      multimedia,
    });
    return await this.documentRepository.save(doc);
  }
}

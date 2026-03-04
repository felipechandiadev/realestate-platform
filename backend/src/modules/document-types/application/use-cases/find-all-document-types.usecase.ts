import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../domain/document-type.repository';
import { DocumentType } from '../../domain/document-type.entity';

@Injectable()
export class FindAllDocumentTypesUseCase {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  execute(): Promise<DocumentType[]> {
    return this.documentTypeRepository.findAll();
  }
}

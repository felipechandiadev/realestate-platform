import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../domain/document-type.repository';
import { DocumentType } from '../../domain/document-type.entity';

@Injectable()
export class FindDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  execute(id: string): Promise<DocumentType | null> {
    return this.documentTypeRepository.findById(id);
  }
}

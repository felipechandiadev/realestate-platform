import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../domain/document-type.repository';
import { DocumentType } from '../../domain/document-type.entity';

@Injectable()
export class CreateDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(dt: DocumentType): Promise<DocumentType> {
    // check existing
    const existing = await this.documentTypeRepository.findByName(dt.name);
    if (existing) {
      throw new Error('El nombre del tipo de documento ya está registrado');
    }
    return await this.documentTypeRepository.save(dt);
  }
}

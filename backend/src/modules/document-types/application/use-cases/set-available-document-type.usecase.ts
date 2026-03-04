import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../domain/document-type.repository';
import { DocumentType } from '../../domain/document-type.entity';

@Injectable()
export class SetAvailableDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(id: string, available: boolean): Promise<DocumentType> {
    const existing = await this.documentTypeRepository.findById(id);
    if (!existing) throw new Error('Tipo de documento no encontrado');
    existing.available = available;
    return await this.documentTypeRepository.save(existing);
  }
}
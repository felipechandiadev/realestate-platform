import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../domain/document-type.repository';
import { DocumentType } from '../../domain/document-type.entity';

@Injectable()
export class UpdateDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(id: string, patch: Partial<DocumentType>): Promise<DocumentType> {
    const existing = await this.documentTypeRepository.findById(id);
    if (!existing) throw new Error('Tipo de documento no encontrado');
    if (patch.name && patch.name !== existing.name) {
      const other = await this.documentTypeRepository.findByName(patch.name);
      if (other) throw new Error('El nombre del tipo de documento ya está registrado');
    }
    const updated = { ...existing, ...patch } as DocumentType;
    return await this.documentTypeRepository.save(updated);
  }
}
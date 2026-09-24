import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../domain/document-type.repository';

@Injectable()
export class SoftDeleteDocumentTypeUseCase {
  constructor(
    private readonly documentTypeRepository: DocumentTypeRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.documentTypeRepository.softDelete(id);
  }
}
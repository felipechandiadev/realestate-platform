import { Injectable, NotFoundException } from '@nestjs/common';
import { Document } from '../../domain/document.entity';
import { DocumentRepository } from '../../domain/document.repository';

@Injectable()
export class GetDocumentUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(id: string): Promise<Document> {
    const doc = await this.documentRepository.findOne(id);
    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }
    return doc;
  }
}

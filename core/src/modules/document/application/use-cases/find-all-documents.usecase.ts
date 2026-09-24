import { Injectable } from '@nestjs/common';
import { Document } from '../../domain/document.entity';
import { DocumentRepository } from '../../domain/document.repository';

@Injectable()
export class FindAllDocumentsUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  execute(): Promise<Document[]> {
    return this.documentRepository.findAll();
  }
}

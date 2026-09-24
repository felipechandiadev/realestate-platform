import { Injectable } from '@nestjs/common';
import { Document } from '../../domain/document.entity';
import { DocumentRepository } from '../../domain/document.repository';

@Injectable()
export class FindDocumentsByPersonUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  execute(personId: string): Promise<Document[]> {
    return this.documentRepository.findByPersonId(personId);
  }
}

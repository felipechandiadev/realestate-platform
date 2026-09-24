import { Injectable } from '@nestjs/common';
import { Document } from '../../domain/document.entity';
import { DocumentRepository } from '../../domain/document.repository';

@Injectable()
export class FindDocumentsByContractUseCase {
  constructor(private readonly documentRepository: DocumentRepository) {}

  execute(contractId: string): Promise<Document[]> {
    return this.documentRepository.findByContractId(contractId);
  }
}

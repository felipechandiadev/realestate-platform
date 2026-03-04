import { Document } from './document.entity';

export abstract class DocumentRepository {
  abstract create(doc: Partial<Document>): Document;
  abstract save(doc: Document): Promise<Document>;
  abstract findAll(): Promise<Document[]>;
  abstract findByPersonId(personId: string): Promise<Document[]>;
  abstract findByContractId(contractId: string): Promise<Document[]>;
  abstract findOne(id: string): Promise<Document | null>;
  abstract softDelete(id: string): Promise<void>;
}

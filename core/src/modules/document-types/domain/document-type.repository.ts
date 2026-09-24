import { DocumentType } from './document-type.entity';

export abstract class DocumentTypeRepository {
  abstract save(dt: DocumentType): Promise<DocumentType>;
  abstract findByName(name: string): Promise<DocumentType | null>;
  abstract findById(id: string): Promise<DocumentType | null>;
  abstract findAll(): Promise<DocumentType[]>;
  abstract softDelete(id: string): Promise<void>;
}
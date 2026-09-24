// Re-export the ORM entity as the runtime `DocumentType` so runtime code
// that calls TypeORM's `getRepository(DocumentType)` will resolve metadata.
import { DocumentTypeOrmEntity } from '../infrastructure/persistence/document-type.orm-entity';

export { DocumentTypeOrmEntity as DocumentType };

// Keep a TypeScript-friendly alias for the domain shape
export type DocumentTypeShape = {
  id: string;
  name: string;
  description?: string | null;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};

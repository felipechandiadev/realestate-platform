import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Document } from '../domain/document.entity';
import { DocumentRepository } from '../domain/document.repository';

@Injectable()
export class TypeormDocumentRepository extends DocumentRepository {
  constructor(
    @InjectRepository(Document)
    private readonly repo: Repository<Document>,
  ) {
    super();
  }

  create(doc: Partial<Document>): Document {
    return this.repo.create(doc);
  }

  save(doc: Document): Promise<Document> {
    return this.repo.save(doc);
  }

  findAll(): Promise<Document[]> {
    return this.repo.find({
      where: { deletedAt: IsNull() },
      relations: ['documentType', 'multimedia', 'uploadedBy', 'person', 'contract'],
    });
  }

  findByPersonId(personId: string): Promise<Document[]> {
    return this.repo.find({
      where: { personId, deletedAt: IsNull() },
      relations: ['documentType', 'multimedia', 'uploadedBy', 'person', 'contract'],
    });
  }

  findByContractId(contractId: string): Promise<Document[]> {
    return this.repo.find({
      where: { contractId, deletedAt: IsNull() },
      relations: ['documentType', 'multimedia', 'uploadedBy', 'person', 'contract'],
      order: { createdAt: 'ASC' },
    });
  }

  findOne(id: string): Promise<Document | null> {
    return this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['documentType', 'multimedia', 'uploadedBy', 'person', 'contract'],
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }
}

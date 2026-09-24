import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { DocumentTypeRepository } from '../../domain/document-type.repository';
import { DocumentType } from '../../domain/document-type.entity';
import { DocumentTypeOrmEntity } from './document-type.orm-entity';

@Injectable()
export class TypeormDocumentTypeRepository extends DocumentTypeRepository {
  constructor(
    @InjectRepository(DocumentTypeOrmEntity)
    private readonly repository: Repository<DocumentTypeOrmEntity>,
  ) {
    super();
  }

  private toDomain(entity: DocumentTypeOrmEntity): DocumentType {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description ?? null,
      available: entity.available,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  private toOrm(domain: DocumentType): DocumentTypeOrmEntity {
    const orm = new DocumentTypeOrmEntity();
    Object.assign(orm, domain);
    return orm;
  }

  async save(dt: DocumentType): Promise<DocumentType> {
    const orm = this.toOrm(dt);
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async findByName(name: string): Promise<DocumentType | null> {
    const found = await this.repository.findOne({ where: { name, deletedAt: IsNull() } });
    return found ? this.toDomain(found) : null;
  }

  async findById(id: string): Promise<DocumentType | null> {
    const found = await this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(): Promise<DocumentType[]> {
    const list = await this.repository.find({ where: { deletedAt: IsNull() } });
    return list.map(e => this.toDomain(e));
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}

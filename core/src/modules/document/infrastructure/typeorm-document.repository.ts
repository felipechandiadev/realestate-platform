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

  async findGrid(query: any = {}): Promise<{ data: Document[]; total: number; page: number; limit: number }> {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 25);
    const exportAll = query.pagination === false || query.pagination === 'false';
    const filtrationOn = query.filtration === true || query.filtration === 'true';
    const filters = filtrationOn ? parseDocumentFilters(query.filters) : {};

    const qb = this.repo
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.documentType', 'documentType')
      .leftJoinAndSelect('document.contract', 'contract')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .leftJoinAndSelect('document.person', 'person')
      .where('document.deletedAt IS NULL');

    const like = (key: string, sql: string, param: string) => {
      const value = filters[key];
      if (!value) return;
      qb.andWhere(sql, { [param]: `%${value}%` });
    };

    like('title', 'LOWER(document.title) LIKE LOWER(:title)', 'title');
    like('documentType', 'LOWER(COALESCE(documentType.name, \'\')) LIKE LOWER(:documentType)', 'documentType');
    if (filters.contractOperation) {
      const raw = filters.contractOperation.toLowerCase();
      const mapped = raw.includes('compra') ? 'COMPRAVENTA' : raw.includes('arrien') ? 'ARRIENDO' : filters.contractOperation;
      qb.andWhere('LOWER(COALESCE(contract.operation, \'\')) LIKE LOWER(:contractOperation)', {
        contractOperation: `%${mapped}%`,
      });
    }
    like('contract', 'LOWER(COALESCE(contract.code, \'\')) LIKE LOWER(:contractCode)', 'contractCode');
    if (filters.status) {
      const statusAliases: Record<string, string> = {
        pendiente: 'PENDING',
        subido: 'UPLOADED',
        recibido: 'RECIBIDO',
        rechazado: 'REJECTED',
      };
      const mapped = statusAliases[filters.status.toLowerCase()] || filters.status;
      qb.andWhere('LOWER(document.status) LIKE LOWER(:statusFilter)', { statusFilter: `%${mapped}%` });
    }
    like('person', 'LOWER(COALESCE(person.name, \'\')) LIKE LOWER(:personName)', 'personName');
    like(
      'uploadedBy',
      `(LOWER(CONCAT(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(uploadedBy.personalInfo, '$.firstName')), ''), ' ', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(uploadedBy.personalInfo, '$.lastName')), ''))) LIKE LOWER(:uploadedBy)
        OR LOWER(COALESCE(uploadedBy.email, '')) LIKE LOWER(:uploadedBy)
        OR LOWER(COALESCE(uploadedBy.username, '')) LIKE LOWER(:uploadedBy))`,
      'uploadedBy',
    );
    like(
      'createdAt',
      `(DATE_FORMAT(document.createdAt, '%Y-%m-%d %H:%i') LIKE :createdAtFilter
        OR DATE_FORMAT(document.createdAt, '%d-%m-%Y') LIKE :createdAtFilter)`,
      'createdAtFilter',
    );

    if (typeof query.search === 'string' && query.search.trim()) {
      qb.andWhere(
        `(LOWER(document.title) LIKE LOWER(:search)
          OR LOWER(COALESCE(documentType.name, '')) LIKE LOWER(:search)
          OR LOWER(COALESCE(contract.code, '')) LIKE LOWER(:search)
          OR LOWER(COALESCE(person.name, '')) LIKE LOWER(:search))`,
        { search: `%${query.search.trim()}%` },
      );
    }

    const sortColumns: Record<string, string> = {
      title: 'document.title',
      documentType: 'documentType.name',
      contractOperation: 'contract.operation',
      contract: 'contract.code',
      status: 'document.status',
      person: 'person.name',
      uploadedBy:
        "CONCAT(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(uploadedBy.personalInfo, '$.firstName')), ''), ' ', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(uploadedBy.personalInfo, '$.lastName')), ''))",
      createdAt: 'document.createdAt',
    };
    const sortField = typeof query.sortField === 'string' ? query.sortField : '';
    const ordered = query.sort === 'asc' || query.sort === 'desc';
    qb.orderBy(ordered ? sortColumns[sortField] || 'document.createdAt' : 'document.createdAt', ordered && query.sort === 'asc' ? 'ASC' : 'DESC');

    const total = await qb.getCount();
    const data = exportAll ? await qb.getMany() : await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, total, page: exportAll ? 1 : page, limit: exportAll ? Math.max(total, 1) : limit };
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

function parseDocumentFilters(filters?: string): Record<string, string> {
  if (!filters) return {};
  const result: Record<string, string> = {};
  for (const pair of String(filters).split(',')) {
    const [column, ...valueParts] = pair.split('-');
    if (!column || valueParts.length === 0) continue;
    try {
      result[column] = decodeURIComponent(valueParts.join('-'));
    } catch {
      result[column] = valueParts.join('-');
    }
  }
  return result;
}

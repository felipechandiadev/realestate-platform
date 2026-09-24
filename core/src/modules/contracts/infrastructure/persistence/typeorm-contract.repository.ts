import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractRepository } from '../../domain/contract.repository';
import { Contract } from '../../domain/contract.entity';
import { ContractOrmEntity } from './contract.orm-entity';

@Injectable()
export class TypeormContractRepository extends ContractRepository {
  constructor(
    @InjectRepository(ContractOrmEntity)
    private readonly repository: Repository<ContractOrmEntity>,
  ) {
    super();
  }

  // expose typeorm manager to callers that need advanced operations
  get manager() {
    return this.repository.manager;
  }

  private toDomain(entity: ContractOrmEntity): Contract {
    // map fields and normalize numeric/json values returned by TypeORM
    const domain: any = {
      id: entity.id,
      code: (entity as any).code,
      userId: (entity as any).userId,
      propertyId: (entity as any).propertyId,
      operation: (entity as any).operation,
      status: (entity as any).status,
      amount: entity.amount !== undefined && entity.amount !== null ? parseFloat(String(entity.amount)) : entity.amount,
      currency: (entity as any).currency,
      ufValue: entity.ufValue !== undefined && entity.ufValue !== null ? parseFloat(String(entity.ufValue)) : entity.ufValue,
      commissionPercent: entity.commissionPercent !== undefined && entity.commissionPercent !== null ? Number(entity.commissionPercent) : entity.commissionPercent,
      commissionAmount: entity.commissionAmount !== undefined && entity.commissionAmount !== null ? parseFloat(String(entity.commissionAmount)) : entity.commissionAmount,
      description: (entity as any).description,
      people: typeof (entity as any).people === 'string' ? JSON.parse((entity as any).people) : (entity as any).people,
      payments: typeof (entity as any).payments === 'string' ? JSON.parse((entity as any).payments) : (entity as any).payments,
      documents: typeof (entity as any).documents === 'string' ? JSON.parse((entity as any).documents) : (entity as any).documents,
      createdAt: (entity as any).createdAt,
      updatedAt: (entity as any).updatedAt,
      deletedAt: (entity as any).deletedAt,
    };

    return domain as Contract;
  }

  private toOrm(domain: Contract): ContractOrmEntity {
    const orm = new ContractOrmEntity();
    Object.assign(orm, domain);
    return orm;
  }

  async save(contract: Contract): Promise<Contract> {
    const orm = this.toOrm(contract);
    // Ensure a contract code is present to satisfy DB non-null constraint
    if (!orm['code']) {
      orm['code'] = `C-${Date.now()}`;
    }
    const saved = await this.repository.save(orm);
    return this.toDomain(saved);
  }

  async update(id: string, patch: Partial<Contract>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  create(entity: Partial<Contract>): Contract {
    return this.repository.create(entity as any) as any;
  }

  async findOne(options: any): Promise<Contract | null> {
    const found = await this.repository.findOne(options);
    return found ? this.toDomain(found) : null;
  }

  async findById(id: string): Promise<Contract | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  async findAll(options?: any): Promise<Contract[] | any> {
    // If options explicitly has skip/take, it's a paginated request
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [items, total] = await this.repository.findAndCount(options);
      return {
        data: items.map(e => this.toDomain(e)),
        total,
      };
    }

    // Otherwise, return simple array for backward compatibility
    const list = await this.repository.find(options);
    return list.map(e => this.toDomain(e));
  }
}

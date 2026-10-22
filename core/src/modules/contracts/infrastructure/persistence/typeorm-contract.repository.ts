import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ContractRepository } from '../../domain/contract.repository';
import { Contract } from '../../domain/contract.entity';
import { ContractOrmEntity } from './contract.orm-entity';
import { ensureContractCode } from '../../domain/contract-code';
import { Property } from '../../../property/domain/property.entity';
import { User } from '../../../users/domain/user.entity';

function parseGridFilters(filters?: string): Record<string, string> {
  if (!filters) return {};
  const result: Record<string, string> = {};
  for (const pair of filters.split(',')) {
    const [column, ...valueParts] = pair.split('-');
    if (!column || valueParts.length === 0) continue;
    const raw = valueParts.join('-');
    try {
      result[column] = decodeURIComponent(raw);
    } catch {
      result[column] = raw;
    }
  }
  return result;
}

const AGENT_NAME_SQL =
  "CONCAT(COALESCE(JSON_UNQUOTE(JSON_EXTRACT(agent.personalInfo, '$.firstName')), ''), ' ', COALESCE(JSON_UNQUOTE(JSON_EXTRACT(agent.personalInfo, '$.lastName')), ''))";

@Injectable()
export class TypeormContractRepository extends ContractRepository {
  constructor(
    @InjectRepository(ContractOrmEntity)
    private readonly repository: Repository<ContractOrmEntity>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
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
      monthlyRent: entity.monthlyRent !== undefined && entity.monthlyRent !== null ? parseFloat(String(entity.monthlyRent)) : entity.monthlyRent,
      commissionPercent: entity.commissionPercent !== undefined && entity.commissionPercent !== null ? Number(entity.commissionPercent) : entity.commissionPercent,
      commissionAmount: entity.commissionAmount !== undefined && entity.commissionAmount !== null ? parseFloat(String(entity.commissionAmount)) : entity.commissionAmount,
      tenantCommissionPercent: entity.tenantCommissionPercent !== undefined && entity.tenantCommissionPercent !== null ? Number(entity.tenantCommissionPercent) : entity.tenantCommissionPercent,
      tenantCommissionAmount: entity.tenantCommissionAmount !== undefined && entity.tenantCommissionAmount !== null ? parseFloat(String(entity.tenantCommissionAmount)) : entity.tenantCommissionAmount,
      landlordCommissionPercent: entity.landlordCommissionPercent !== undefined && entity.landlordCommissionPercent !== null ? Number(entity.landlordCommissionPercent) : entity.landlordCommissionPercent,
      landlordCommissionAmount: entity.landlordCommissionAmount !== undefined && entity.landlordCommissionAmount !== null ? parseFloat(String(entity.landlordCommissionAmount)) : entity.landlordCommissionAmount,
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

  private async attachProperties(contracts: Contract[]): Promise<void> {
    const ids = [
      ...new Set(
        contracts
          .map((contract) => contract.propertyId)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    ];
    if (ids.length === 0) return;

    const properties = await this.propertyRepository.find({
      where: { id: In(ids) },
      select: {
        id: true,
        code: true,
        title: true,
        address: true,
        city: true,
        price: true,
        currencyPrice: true,
      },
    });
    const byId = new Map(properties.map((property) => [property.id, property]));

    for (const contract of contracts) {
      const property = contract.propertyId ? byId.get(contract.propertyId) : undefined;
      if (!property) continue;
      contract.property = {
        id: property.id,
        code: property.code,
        title: property.title,
        address: property.address,
        city: property.city,
        price: property.price != null ? Number(property.price) : undefined,
        currencyPrice: property.currencyPrice,
      };
    }
  }

  private toOrm(domain: Contract): ContractOrmEntity {
    const orm = new ContractOrmEntity();
    Object.assign(orm, domain);
    return orm;
  }

  async save(contract: Contract): Promise<Contract> {
    const orm = this.toOrm(contract);
    // Ensure a contract code is present to satisfy DB non-null constraint
    ensureContractCode(orm);
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
    if (!found) return null;
    const domain = this.toDomain(found);
    await this.attachProperties([domain]);
    return domain;
  }

  async findById(id: string): Promise<Contract | null> {
    const found = await this.repository.findOne({ where: { id } });
    if (!found) return null;
    const domain = this.toDomain(found);
    await this.attachProperties([domain]);
    return domain;
  }

  async findForGrid(
    query: any = {},
  ): Promise<{ data: Contract[]; total: number; page?: number; limit?: number } | Contract[]> {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, parseInt(query.limit, 10) || 25);
    const filtrationOn = query.filtration === true || query.filtration === 'true';
    const columnFilters = filtrationOn
      ? parseGridFilters(typeof query.filters === 'string' ? query.filters : '')
      : {};
    const exportAll = query.pagination === false || query.pagination === 'false';
    const hasGridQuery = Boolean(
      query.page !== undefined ||
        query.limit !== undefined ||
        query.sort ||
        query.sortField ||
        query.filters ||
        query.filtration !== undefined ||
        query.pagination !== undefined ||
        query.search,
    );
    const paginate =
      !exportAll &&
      (query.pagination === true ||
        query.pagination === 'true' ||
        query.page !== undefined ||
        query.limit !== undefined);

    const qb = this.repository
      .createQueryBuilder('contract')
      .leftJoin(Property, 'property', 'property.id = contract.propertyId')
      .leftJoin(User, 'agent', 'agent.id = contract.userId');

    if (query.operation) {
      qb.andWhere('contract.operation = :operation', { operation: query.operation });
    }
    if (query.userId) {
      qb.andWhere('contract.userId = :userId', { userId: query.userId });
    }

    const like = (columnKey: string, sql: string, param: string) => {
      const value = columnFilters[columnKey];
      if (!value) return;
      qb.andWhere(sql, { [param]: `%${value}%` });
    };

    like('code', 'LOWER(COALESCE(contract.code, \'\')) LIKE LOWER(:code)', 'code');
    like('status', 'LOWER(contract.status) LIKE LOWER(:statusFilter)', 'statusFilter');
    like(
      'propertyTitle',
      `(LOWER(COALESCE(property.title, '')) LIKE LOWER(:propertyTitle)
        OR LOWER(COALESCE(property.address, '')) LIKE LOWER(:propertyTitle)
        OR LOWER(COALESCE(property.city, '')) LIKE LOWER(:propertyTitle))`,
      'propertyTitle',
    );
    like('amount', 'CAST(contract.amount AS CHAR) LIKE :amountFilter', 'amountFilter');
    like(
      'commissionAmount',
      'CAST(contract.commissionAmount AS CHAR) LIKE :commissionFilter',
      'commissionFilter',
    );
    like(
      'agentName',
      `(LOWER(${AGENT_NAME_SQL}) LIKE LOWER(:agentName)
        OR LOWER(COALESCE(agent.username, '')) LIKE LOWER(:agentName)
        OR LOWER(COALESCE(agent.email, '')) LIKE LOWER(:agentName))`,
      'agentName',
    );
    like(
      'clientName',
      'LOWER(CAST(contract.people AS CHAR)) LIKE LOWER(:clientName)',
      'clientName',
    );
    like(
      'createdAt',
      `(DATE_FORMAT(contract.createdAt, '%Y-%m-%d %H:%i') LIKE :createdAtFilter
        OR DATE_FORMAT(contract.createdAt, '%d-%m-%Y') LIKE :createdAtFilter)`,
      'createdAtFilter',
    );
    like(
      'endDate',
      `(DATE_FORMAT(contract.endDate, '%Y-%m-%d') LIKE :endDateFilter
        OR DATE_FORMAT(contract.endDate, '%d-%m-%Y') LIKE :endDateFilter)`,
      'endDateFilter',
    );

    if (typeof query.search === 'string' && query.search.trim() !== '') {
      qb.andWhere(
        `(LOWER(COALESCE(contract.code, '')) LIKE LOWER(:search)
          OR LOWER(contract.status) LIKE LOWER(:search)
          OR LOWER(COALESCE(property.title, '')) LIKE LOWER(:search)
          OR LOWER(CAST(contract.people AS CHAR)) LIKE LOWER(:search)
          OR LOWER(${AGENT_NAME_SQL}) LIKE LOWER(:search)
          OR LOWER(COALESCE(agent.email, '')) LIKE LOWER(:search))`,
        { search: `%${query.search.trim()}%` },
      );
    }

    const direction = String(query.sort || '').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const sortColumns: Record<string, string> = {
      code: 'contract.code',
      status: 'contract.status',
      propertyTitle: 'property.title',
      amount: 'contract.amount',
      commissionAmount: 'contract.commissionAmount',
      agentName: AGENT_NAME_SQL,
      clientName: "JSON_UNQUOTE(JSON_EXTRACT(contract.people, '$[0].personName'))",
      createdAt: 'contract.createdAt',
      endDate: 'contract.endDate',
    };
    const sortField = typeof query.sortField === 'string' ? query.sortField : '';
    const orderCol =
      query.sort === 'asc' || query.sort === 'desc'
        ? sortColumns[sortField] || 'contract.createdAt'
        : 'contract.createdAt';
    const orderDir = query.sort === 'asc' || query.sort === 'desc' ? direction : 'DESC';
    qb.orderBy(orderCol, orderDir as 'ASC' | 'DESC');

    const total = await qb.getCount();
    const items = paginate ? await qb.skip((page - 1) * limit).take(limit).getMany() : await qb.getMany();
    const data = items.map((item) => this.toDomain(item));
    await this.attachProperties(data);
    await this.attachAgents(data);

    if (!paginate && !exportAll && !hasGridQuery) {
      return data;
    }
    return { data, total, page: paginate ? page : 1, limit: paginate ? limit : data.length };
  }

  private async attachAgents(contracts: Contract[]): Promise<void> {
    const ids = [
      ...new Set(
        contracts
          .map((contract) => contract.userId)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    ];
    if (ids.length === 0) return;

    const users = await this.repository.manager.getRepository(User).find({
      where: { id: In(ids) },
    });
    const byId = new Map(users.map((user) => [user.id, user]));
    for (const contract of contracts) {
      const user = contract.userId ? byId.get(contract.userId) : undefined;
      if (!user) continue;
      contract.user = {
        id: user.id,
        personalInfo: user.personalInfo,
        username: user.username,
        email: user.email,
        firstName: user.personalInfo?.firstName,
        lastName: user.personalInfo?.lastName,
      } as Contract['user'];
    }
  }

  async findAll(options?: any): Promise<Contract[] | any> {
    // If options explicitly has skip/take, it's a paginated request
    if (options?.skip !== undefined || options?.take !== undefined) {
      const [items, total] = await this.repository.findAndCount(options);
      const data = items.map(e => this.toDomain(e));
      await this.attachProperties(data);
      return {
        data,
        total,
      };
    }

    // Otherwise, return simple array for backward compatibility
    const list = (await this.repository.find(options)).map(e => this.toDomain(e));
    await this.attachProperties(list);
    return list;
  }
}

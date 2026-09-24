import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyRepository } from '../domain/property.repository';
import { Property } from '../domain/property.entity';

@Injectable()
export class TypeormPropertyRepository extends PropertyRepository {
  constructor(
    @InjectRepository(Property)
    private readonly repository: Repository<Property>,
  ) {
    super();
  }

  get manager() {
    return this.repository.manager;
  }

  create(data: Partial<Property>): Property {
    return (this.repository.create(data as any) as unknown) as Property;
  }

  async save(entity: Property): Promise<Property> {
    return this.repository.save(entity as any);
  }

  async find(options?: any): Promise<Property[]> {
    return this.repository.find(options);
  }

  async count(options?: any): Promise<number> {
    return this.repository.count(options);
  }

  async findOne(options?: any): Promise<Property | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<Property>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}

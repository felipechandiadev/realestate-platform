import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PropertyTypeRepository } from '../domain/property-type.repository';
import { PropertyType } from '../domain/property-type.entity';

@Injectable()
export class TypeormPropertyTypeRepository extends PropertyTypeRepository {
  constructor(
    @InjectRepository(PropertyType)
    private readonly repository: Repository<PropertyType>,
  ) {
    super();
  }

  create(data: Partial<PropertyType>): PropertyType {
    return (this.repository.create(data as any) as unknown) as PropertyType;
  }

  async save(pt: PropertyType): Promise<PropertyType> {
    return this.repository.save(pt as any);
  }

  async find(options?: any): Promise<PropertyType[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<PropertyType | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<PropertyType>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}

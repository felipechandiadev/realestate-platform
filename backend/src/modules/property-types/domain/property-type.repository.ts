import { SelectQueryBuilder } from 'typeorm';
import { PropertyType } from './property-type.entity';

export abstract class PropertyTypeRepository {
  abstract create(data: Partial<PropertyType>): PropertyType;
  abstract save(pt: PropertyType): Promise<PropertyType>;
  abstract find(options?: any): Promise<PropertyType[]>;
  abstract findOne(options?: any): Promise<PropertyType | null>;
  abstract update(id: string, patch: Partial<PropertyType>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<PropertyType>;
}
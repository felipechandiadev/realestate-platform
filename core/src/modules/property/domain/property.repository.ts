import { Property } from './property.entity';

export abstract class PropertyRepository {
	abstract create(data: Partial<Property>): Property;
	abstract save(entity: Property): Promise<Property>;
	abstract find(options?: any): Promise<Property[]>;
	abstract findOne(options?: any): Promise<Property | null>;
	abstract count(options?: any): Promise<number>;
	abstract update(id: string, patch: Partial<Property>): Promise<any>;
	abstract softDelete(id: string): Promise<any>;
	abstract createQueryBuilder(alias: string): any;
	abstract get manager(): any;
}

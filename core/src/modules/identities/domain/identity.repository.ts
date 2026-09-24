import { SelectQueryBuilder } from 'typeorm';
import { Identity } from './identity.entity';

export abstract class IdentityRepository {
  abstract create(data: Partial<Identity>): Identity;
  abstract save(identity: Identity): Promise<Identity>;
  abstract find(options?: any): Promise<Identity[]>;
  abstract findOne(options?: any): Promise<Identity | null>;
  abstract update(id: string, patch: Partial<Identity>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<Identity>;
}

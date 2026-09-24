import { SelectQueryBuilder } from 'typeorm';
import { Multimedia } from './multimedia.entity';

export abstract class MultimediaRepository {
  abstract create(data: Partial<Multimedia>): Multimedia;
  abstract save(m: Multimedia): Promise<Multimedia>;
  abstract find(options?: any): Promise<Multimedia[]>;
  abstract findOne(options?: any): Promise<Multimedia | null>;
  abstract update(id: string, patch: Partial<Multimedia>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract remove(m: Multimedia): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<Multimedia>;
}
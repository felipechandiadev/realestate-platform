import { DataSource, SelectQueryBuilder } from 'typeorm';
import { Slide } from '../domain/slide.entity';

export abstract class SlideRepository {
  abstract get manager(): DataSource['manager'];
  abstract create(data: Partial<Slide>): Slide;
  abstract save(slide: Slide): Promise<Slide>;
  abstract find(options?: any): Promise<Slide[]>;
  abstract findOne(options?: any): Promise<Slide | null>;
  abstract update(id: string, patch: Partial<Slide>): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
  abstract createQueryBuilder(alias: string): SelectQueryBuilder<Slide>;
}

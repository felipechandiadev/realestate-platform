import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { MultimediaRepository } from '../domain/multimedia.repository';
import { Multimedia } from '../domain/multimedia.entity';

@Injectable()
export class TypeormMultimediaRepository extends MultimediaRepository {
  constructor(
    @InjectRepository(Multimedia)
    private readonly repository: Repository<Multimedia>,
  ) {
    super();
  }

  create(data: Partial<Multimedia>): Multimedia {
    return (this.repository.create(data as any) as unknown) as Multimedia;
  }

  async save(m: Multimedia): Promise<Multimedia> {
    return this.repository.save(m as any);
  }

  async find(options?: any): Promise<Multimedia[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Multimedia | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<Multimedia>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async remove(m: Multimedia): Promise<void> {
    await this.repository.remove(m as any);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}
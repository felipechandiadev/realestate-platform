import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IdentityRepository } from '../domain/identity.repository';
import { Identity } from '../domain/identity.entity';

@Injectable()
export class TypeormIdentityRepository extends IdentityRepository {
  constructor(
    @InjectRepository(Identity)
    private readonly repository: Repository<Identity>,
  ) {
    super();
  }

  create(data: Partial<Identity>): Identity {
    return (this.repository.create(data as any) as unknown) as Identity;
  }

  async save(identity: Identity): Promise<Identity> {
    return this.repository.save(identity as any);
  }

  async find(options?: any): Promise<Identity[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<Identity | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<Identity>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class TypeormUserRepository extends UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {
    super();
  }

  get manager() {
    return this.repository.manager;
  }

  create(data: Partial<User>): User {
    // TypeORM's Repository.create can return User or User[] depending on input
    // cast through unknown to satisfy TypeScript
    return (this.repository.create(data as any) as unknown) as User;
  }

  async save(user: User): Promise<User> {
    return this.repository.save(user as any);
  }

  async find(options?: any): Promise<User[]> {
    return this.repository.find(options);
  }

  async findOne(options?: any): Promise<User | null> {
    const found = await this.repository.findOne(options);
    return found || null;
  }

  async update(id: string, patch: Partial<User>): Promise<void> {
    await this.repository.update(id, patch as any);
  }

  async softDelete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }
}

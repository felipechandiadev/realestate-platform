import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetTokenRepository } from '../../domain/password-reset-token.repository';
import { PasswordResetToken } from '../../domain/password-reset-token.entity';
import { PasswordResetTokenOrmEntity } from './password-reset-token.orm-entity';

@Injectable()
export class TypeormPasswordResetTokenRepository extends PasswordResetTokenRepository {
  constructor(
    @InjectRepository(PasswordResetTokenOrmEntity)
    private readonly repository: Repository<PasswordResetTokenOrmEntity>,
  ) {
    super();
  }

  private toDomain(entity: PasswordResetTokenOrmEntity): PasswordResetToken {
    return {
      id: entity.id,
      userId: entity.userId,
      token: entity.token,
      expiresAt: entity.expiresAt,
      consumedAt: entity.consumedAt,
      requestedIp: entity.requestedIp,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private toOrm(domain: PasswordResetToken): PasswordResetTokenOrmEntity {
    const orm = new PasswordResetTokenOrmEntity();
    Object.assign(orm, domain);
    return orm;
  }
  async save(token: PasswordResetToken): Promise<PasswordResetToken> {
    const ormEntity = this.toOrm(token);
    const saved = await this.repository.save(ormEntity);
    return this.toDomain(saved);
  }



  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const found = await this.repository.findOne({ where: { token }, relations: ['user'] });
    return found ? this.toDomain(found) : null;
  }

  async update(token: PasswordResetToken): Promise<PasswordResetToken> {
    const ormEntity = this.toOrm(token);
    const updated = await this.repository.save(ormEntity);
    return this.toDomain(updated);
  }

  async markExistingAsConsumed(userId: string): Promise<void> {
    await this.repository.createQueryBuilder()
      .update()
      .set({ consumedAt: () => 'NOW()' })
      .where('userId = :userId', { userId })
      .andWhere('consumedAt IS NULL')
      .execute();
  }

  // helpers for abstract contract
  async findOne(options: any): Promise<PasswordResetToken | null> {
    const found = await this.repository.findOne(options);
    return found ? this.toDomain(found) : null;
  }

  async find(options?: any): Promise<PasswordResetToken[]> {
    const list = await this.repository.find(options);
    return list.map(e => this.toDomain(e));
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async updateById(id: string, partial: Partial<PasswordResetToken>): Promise<any> {
    return this.repository.update(id, partial as any);
  }
}

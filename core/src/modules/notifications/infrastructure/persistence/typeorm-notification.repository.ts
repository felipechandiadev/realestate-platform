import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationRepository } from '../../domain/notification.repository';
import { Notification } from '../../domain/notification.entity';
import { NotificationOrmEntity } from './notification.orm-entity';

@Injectable()
export class TypeormNotificationRepository extends NotificationRepository {
  constructor(
    @InjectRepository(NotificationOrmEntity)
    private readonly repository: Repository<NotificationOrmEntity>,
  ) {
    super();
  }

  private toDomain(entity: NotificationOrmEntity): Notification {
    return {
      id: entity.id,
      senderType: entity.senderType,
      senderId: entity.senderId,
      senderName: entity.senderName,
      isSystem: entity.isSystem,
      message: entity.message,
      targetUserIds: entity.targetUserIds,
      type: entity.type,
      targetMails: entity.targetMails,
      status: entity.status,
      interestedUserEmail: entity.interestedUserEmail,
      interestedUserName: entity.interestedUserName,
      interestedUserPhone: entity.interestedUserPhone,
      interestedUserMessage: entity.interestedUserMessage,
      firstViewerId: entity.firstViewerId,
      firstViewedAt: entity.firstViewedAt,
      multimediaId: entity.multimedia ? (entity.multimedia as any).id : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }

  private toOrm(domain: Notification): NotificationOrmEntity {
    const orm = new NotificationOrmEntity();
    Object.assign(orm, domain);
    return orm;
  }

  async save(notification: Notification): Promise<Notification> {
    const ormEntity = this.toOrm(notification);
    const saved = await this.repository.save(ormEntity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Notification | null> {
    const found = await this.repository.findOne({ where: { id } });
    return found ? this.toDomain(found) : null;
  }

  // implementations for abstract helpers
  async findOne(options: any): Promise<Notification | null> {
    const found = await this.repository.findOne(options);
    return found ? this.toDomain(found) : null;
  }

  async find(options?: any): Promise<Notification[]> {
    const entities = await this.repository.find(options);
    return entities.map(e => this.toDomain(e));
  }

  createQueryBuilder(alias: string) {
    return this.repository.createQueryBuilder(alias);
  }

  async update(id: string, partial: Partial<Notification>): Promise<any> {
    // TypeORM expects a deep partial entity; cast to any to accommodate nullable fields
    return this.repository.update(id, partial as any);
  }

  async findAll(options?: any): Promise<Notification[]> {
    const entities = await this.repository.find(options);
    return entities.map(e => this.toDomain(e));
  }

  async findAndCount(options?: any): Promise<[Notification[], number]> {
    const [entities, total] = await this.repository.findAndCount(options);
    return [entities.map(e => this.toDomain(e)), total];
  }
}

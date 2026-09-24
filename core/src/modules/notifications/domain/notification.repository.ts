import { Notification } from './notification.entity';

export abstract class NotificationRepository {
  abstract save(notification: Notification): Promise<Notification>;
  abstract findById(id: string): Promise<Notification | null>;
  abstract findAll(options?: any): Promise<Notification[]>;

  // additional helpers used by service
  abstract findOne(options: any): Promise<Notification | null>;
  abstract find(options?: any): Promise<Notification[]>;
  abstract createQueryBuilder(alias: string): any;
  abstract update(id: string, partial: Partial<Notification>): Promise<any>;
  abstract findAndCount?(options?: any): Promise<[Notification[], number]>;
}

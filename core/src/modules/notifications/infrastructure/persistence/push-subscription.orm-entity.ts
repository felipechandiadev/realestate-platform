import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_push_subscriptions')
@Index('IDX_notification_push_subscriptions_user', ['userId'])
@Index('UQ_notification_push_subscriptions_endpointHash', ['endpointHash'], { unique: true })
export class PushSubscriptionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'text' })
  endpoint: string;

  @Column({ type: 'char', length: 64 })
  endpointHash: string;

  @Column({ type: 'varchar', length: 512 })
  p256dh: string;

  @Column({ type: 'varchar', length: 512 })
  auth: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  userAgent?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
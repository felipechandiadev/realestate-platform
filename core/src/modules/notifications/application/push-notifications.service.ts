import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import * as webpush from 'web-push';
import { Repository } from 'typeorm';
import { PushSubscriptionOrmEntity } from '../infrastructure/persistence/push-subscription.orm-entity';

export type BrowserPushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private configured = false;

  constructor(
    @InjectRepository(PushSubscriptionOrmEntity)
    private readonly subscriptions: Repository<PushSubscriptionOrmEntity>,
    private readonly config: ConfigService,
  ) {
    const publicKey = this.config.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.config.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.config.get<string>('VAPID_SUBJECT');
    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
      this.configured = true;
    }
  }

  getPublicKey(): string | null {
    return this.configured ? this.config.get<string>('VAPID_PUBLIC_KEY') ?? null : null;
  }

  async saveSubscription(
    userId: string,
    subscription: BrowserPushSubscription,
    userAgent?: string,
  ): Promise<void> {
    const endpointHash = this.endpointHash(subscription.endpoint);
    const existing = await this.subscriptions.findOne({ where: { endpointHash } });
    if (existing && existing.userId !== userId) {
      throw new ConflictException('Este navegador ya está registrado para otra cuenta.');
    }
    await this.subscriptions.save(this.subscriptions.create({
      ...(existing ? { id: existing.id } : {}),
      userId,
      endpoint: subscription.endpoint,
      endpointHash,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userAgent: userAgent?.slice(0, 32),
    }));
  }

  async removeSubscription(userId: string, endpoint: string): Promise<void> {
    await this.subscriptions.delete({ userId, endpointHash: this.endpointHash(endpoint) });
  }

  async notifyUsers(userIds: string[], notificationId: string): Promise<void> {
    if (!this.configured || userIds.length === 0) return;
    const records = await this.subscriptions
      .createQueryBuilder('subscription')
      .where('subscription.userId IN (:...userIds)', { userIds })
      .getMany();

    const payload = JSON.stringify({
      title: 'Nueva notificación',
      body: 'Tienes una nueva notificación.',
      url: `/notifications?notificationId=${encodeURIComponent(notificationId)}`,
      tag: `notification-${notificationId}`,
    });

    await Promise.all(records.map(async (record) => {
      try {
        await webpush.sendNotification({
          endpoint: record.endpoint,
          keys: { p256dh: record.p256dh, auth: record.auth },
        }, payload, { TTL: 60 * 60 });
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await this.subscriptions.delete({ id: record.id });
          return;
        }
        this.logger.warn(`Push delivery failed for subscription ${record.id}: ${statusCode ?? 'unknown'}`);
      }
    }));
  }

  private endpointHash(endpoint: string): string {
    return createHash('sha256').update(endpoint).digest('hex');
  }
}
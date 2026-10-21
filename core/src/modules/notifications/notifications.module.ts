import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './application/notifications.service';
import { NotificationsController } from './presentation/notifications.controller';
import { NotificationRepository } from './domain/notification.repository';
import { User } from '../users/domain/user.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { TypeormNotificationRepository } from './infrastructure/persistence/typeorm-notification.repository';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { Property } from '../property/domain/property.entity';
import { NotificationOrmEntity } from './infrastructure/persistence/notification.orm-entity';
import { NotificationsGateway } from './presentation/notifications.gateway';
import { PushSubscriptionOrmEntity } from './infrastructure/persistence/push-subscription.orm-entity';
import { PushNotificationsService } from './application/push-notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationOrmEntity, PushSubscriptionOrmEntity, User, Property]),
    ConfigModule,
    UsersModule,
    AuthModule,
    MailModule
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    PushNotificationsService,
    {
      provide: NotificationRepository,
      useClass: TypeormNotificationRepository,
    },
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}

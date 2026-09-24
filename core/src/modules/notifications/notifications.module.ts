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

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationOrmEntity, User, Property]),
    ConfigModule,
    UsersModule,
    AuthModule,
    MailModule
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: NotificationRepository,
      useClass: TypeormNotificationRepository,
    },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}

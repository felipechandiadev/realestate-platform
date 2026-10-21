import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationPushSubscriptions1792160000000 implements MigrationInterface {
  name = 'CreateNotificationPushSubscriptions1792160000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS notification_push_subscriptions (
        id varchar(36) NOT NULL,
        userId varchar(36) NOT NULL,
        endpoint text NOT NULL,
        endpointHash char(64) NOT NULL,
        p256dh varchar(512) NOT NULL,
        auth varchar(512) NOT NULL,
        userAgent varchar(32) NULL,
        createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        updatedAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (id),
        UNIQUE KEY UQ_notification_push_subscriptions_endpointHash (endpointHash),
        KEY IDX_notification_push_subscriptions_user (userId)
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS notification_push_subscriptions');
  }
}
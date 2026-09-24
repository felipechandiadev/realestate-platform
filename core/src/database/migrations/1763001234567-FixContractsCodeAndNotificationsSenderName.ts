import { MigrationInterface, QueryRunner } from "typeorm";

export class FixContractsCodeAndNotificationsSenderName1763001234567 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Make `code` nullable with a safe default so legacy inserts don't fail
        await queryRunner.query(`ALTER TABLE ` + "`contracts`" + ` MODIFY COLUMN ` + "`code`" + ` VARCHAR(64) NULL DEFAULT '';`);
        // Make notifications.senderName nullable with default
        await queryRunner.query(`ALTER TABLE ` + "`notifications`" + ` MODIFY COLUMN ` + "`senderName`" + ` VARCHAR(255) NULL DEFAULT '';`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert to NOT NULL without default (best-effort)
        try {
            await queryRunner.query(`ALTER TABLE ` + "`contracts`" + ` MODIFY COLUMN ` + "`code`" + ` VARCHAR(64) NOT NULL;`);
        } catch (e) {
            // ignore
        }
        try {
            await queryRunner.query(`ALTER TABLE ` + "`notifications`" + ` MODIFY COLUMN ` + "`senderName`" + ` VARCHAR(255) NOT NULL;`);
        } catch (e) {
            // ignore
        }
    }

}

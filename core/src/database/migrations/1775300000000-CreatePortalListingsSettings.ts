import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortalListingsSettings1775300000000 implements MigrationInterface {
  name = 'CreatePortalListingsSettings1775300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.query(
      `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'portal_listings_settings'
      `,
    );
    if (table.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`portal_listings_settings\` (
          \`id\` varchar(36) NOT NULL,
          \`listingsFilterVariant\` varchar(32) NOT NULL DEFAULT 'classic',
          \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    const rows = await queryRunner.query('SELECT `id` FROM `portal_listings_settings` LIMIT 1');
    if (rows.length === 0) {
      await queryRunner.query(`
        INSERT INTO \`portal_listings_settings\` (\`id\`, \`listingsFilterVariant\`)
        VALUES (UUID(), 'classic')
      `);
    }

    const entityType = await queryRunner.query(
      `
        SELECT COLUMN_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'audit_logs'
          AND COLUMN_NAME = 'entityType'
      `,
    );
    const columnType = entityType[0]?.COLUMN_TYPE as string | undefined;
    if (columnType?.startsWith('enum(') && !columnType.includes("'PORTAL_LISTINGS'")) {
      const next = columnType.replace(/\)$/, ",'PORTAL_LISTINGS')");
      await queryRunner.query(`ALTER TABLE \`audit_logs\` MODIFY \`entityType\` ${next} NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `portal_listings_settings`');
  }
}

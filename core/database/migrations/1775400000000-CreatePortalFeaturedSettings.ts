import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortalFeaturedSettings1775400000000 implements MigrationInterface {
  name = 'CreatePortalFeaturedSettings1775400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.query(
      `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'portal_featured_settings'
      `,
    );
    if (table.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`portal_featured_settings\` (
          \`id\` varchar(36) NOT NULL,
          \`layoutDesktop\` varchar(16) NOT NULL DEFAULT 'band',
          \`gridColumns\` int NOT NULL DEFAULT 3,
          \`gridRows\` int NOT NULL DEFAULT 2,
          \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    const rows = await queryRunner.query('SELECT `id` FROM `portal_featured_settings` LIMIT 1');
    if (rows.length === 0) {
      await queryRunner.query(`
        INSERT INTO \`portal_featured_settings\` (\`id\`, \`layoutDesktop\`, \`gridColumns\`, \`gridRows\`)
        VALUES (UUID(), 'band', 3, 2)
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
    if (columnType?.startsWith('enum(') && !columnType.includes("'PORTAL_FEATURED'")) {
      const next = columnType.replace(/\)$/, ",'PORTAL_FEATURED')");
      await queryRunner.query(`ALTER TABLE \`audit_logs\` MODIFY \`entityType\` ${next} NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `portal_featured_settings`');
  }
}

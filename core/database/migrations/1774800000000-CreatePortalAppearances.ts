import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePortalAppearances1774800000000 implements MigrationInterface {
  name = 'CreatePortalAppearances1774800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.query(
      `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'portal_appearances'
      `,
    );
    if (table.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`portal_appearances\` (
          \`id\` varchar(36) NOT NULL,
          \`primary\` varchar(7) NOT NULL DEFAULT '#1e73ae',
          \`secondary\` varchar(7) NOT NULL DEFAULT '#00deef',
          \`background\` varchar(7) NOT NULL DEFAULT '#ffffff',
          \`foreground\` varchar(7) NOT NULL DEFAULT '#131615',
          \`accent\` varchar(7) NOT NULL DEFAULT '#02578b',
          \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    const rows = await queryRunner.query('SELECT `id` FROM `portal_appearances` LIMIT 1');
    if (rows.length === 0) {
      await queryRunner.query(`
        INSERT INTO \`portal_appearances\` (
          \`id\`, \`primary\`, \`secondary\`, \`background\`, \`foreground\`, \`accent\`
        ) VALUES (UUID(), '#1e73ae', '#00deef', '#ffffff', '#131615', '#02578b')
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
    if (columnType?.startsWith('enum(') && !columnType.includes("'APPEARANCE'")) {
      const next = columnType.replace(/\)$/, ",'APPEARANCE')");
      await queryRunner.query(`ALTER TABLE \`audit_logs\` MODIFY \`entityType\` ${next} NOT NULL`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `portal_appearances`');
  }
}

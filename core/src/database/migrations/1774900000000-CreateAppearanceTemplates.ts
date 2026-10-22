import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppearanceTemplates1774900000000 implements MigrationInterface {
  name = 'CreateAppearanceTemplates1774900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.query(
      `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'appearance_templates'
      `,
    );
    if (table.length === 0) {
      await queryRunner.query(`
        CREATE TABLE \`appearance_templates\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` varchar(80) NOT NULL,
          \`primary\` varchar(7) NOT NULL,
          \`secondary\` varchar(7) NOT NULL,
          \`background\` varchar(7) NOT NULL,
          \`foreground\` varchar(7) NOT NULL,
          \`accent\` varchar(7) NOT NULL,
          \`isSystem\` tinyint NOT NULL DEFAULT 0,
          \`sortOrder\` int NOT NULL DEFAULT 0,
          \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    const rows = await queryRunner.query(
      'SELECT `id` FROM `appearance_templates` WHERE `isSystem` = 1 LIMIT 1',
    );
    if (rows.length === 0) {
      await queryRunner.query(`
        INSERT INTO \`appearance_templates\` (
          \`id\`, \`name\`, \`primary\`, \`secondary\`, \`background\`, \`foreground\`, \`accent\`,
          \`isSystem\`, \`sortOrder\`
        ) VALUES (
          UUID(), 'Bravo Schott', '#1e73ae', '#00deef', '#ffffff', '#131615', '#02578b', 1, 0
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `appearance_templates`');
  }
}

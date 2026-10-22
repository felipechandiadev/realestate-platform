import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHeroSlidePresentation1774600000000 implements MigrationInterface {
  name = 'AddHeroSlidePresentation1774600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const slideColumns: Array<{ name: string; ddl: string }> = [
      { name: 'cta_label', ddl: 'ALTER TABLE `slides` ADD `cta_label` varchar(80) NULL' },
      { name: 'cta_style', ddl: "ALTER TABLE `slides` ADD `cta_style` varchar(10) NOT NULL DEFAULT 'none'" },
      { name: 'text_align', ddl: "ALTER TABLE `slides` ADD `text_align` varchar(10) NOT NULL DEFAULT 'left'" },
      { name: 'overlay_opacity', ddl: 'ALTER TABLE `slides` ADD `overlay_opacity` smallint NOT NULL DEFAULT 45' },
      { name: 'text_color', ddl: 'ALTER TABLE `slides` ADD `text_color` varchar(7) NULL' },
      { name: 'cta_button_bg_color', ddl: 'ALTER TABLE `slides` ADD `cta_button_bg_color` varchar(7) NULL' },
      { name: 'cta_button_text_color', ddl: 'ALTER TABLE `slides` ADD `cta_button_text_color` varchar(7) NULL' },
      { name: 'cta_link_color', ddl: 'ALTER TABLE `slides` ADD `cta_link_color` varchar(7) NULL' },
    ];

    for (const column of slideColumns) {
      const existing = await queryRunner.query(
        `
          SELECT COLUMN_NAME
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'slides'
            AND COLUMN_NAME = ?
        `,
        [column.name],
      );
      if (existing.length === 0) {
        await queryRunner.query(column.ddl);
      }
    }

    const titleColumn = await queryRunner.query(
      `
        SELECT IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'slides'
          AND COLUMN_NAME = 'title'
      `,
    );
    if (titleColumn[0]?.IS_NULLABLE === 'NO') {
      await queryRunner.query('ALTER TABLE `slides` MODIFY `title` varchar(255) NULL');
    }

    const autoplay = await queryRunner.query(
      `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'identities'
          AND COLUMN_NAME = 'hero_autoplay_seconds'
      `,
    );
    if (autoplay.length === 0) {
      await queryRunner.query(
        'ALTER TABLE `identities` ADD `hero_autoplay_seconds` smallint NOT NULL DEFAULT 6',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE `identities` DROP COLUMN `hero_autoplay_seconds`');
    await queryRunner.query('ALTER TABLE `slides` MODIFY `title` varchar(255) NOT NULL');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `cta_link_color`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `cta_button_text_color`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `cta_button_bg_color`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `text_color`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `overlay_opacity`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `text_align`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `cta_style`');
    await queryRunner.query('ALTER TABLE `slides` DROP COLUMN `cta_label`');
  }
}

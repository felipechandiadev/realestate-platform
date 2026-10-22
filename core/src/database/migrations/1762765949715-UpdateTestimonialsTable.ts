import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ajusta la tabla `testimonials` al modelo actual (MySQL).
 *
 * La versión original usaba sintaxis de PostgreSQL (comillas dobles,
 * `DROP COLUMN IF EXISTS`, tipo `uuid`) y además eliminaba `multimediaId`,
 * columna que la entidad `Testimonial` todavía usa (ManyToOne a multimedia).
 * Esta versión es MySQL, idempotente y NO elimina `multimediaId`.
 */
export class UpdateTestimonialsTable1762765949715 implements MigrationInterface {
  name = 'UpdateTestimonialsTable1762765949715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('testimonials'))) return;

    const hasText = await queryRunner.hasColumn('testimonials', 'text');
    const hasContent = await queryRunner.hasColumn('testimonials', 'content');
    if (hasText && !hasContent) {
      await queryRunner.query(
        'ALTER TABLE `testimonials` CHANGE COLUMN `text` `content` TEXT NOT NULL',
      );
    }

    if (!(await queryRunner.hasColumn('testimonials', 'position'))) {
      await queryRunner.query(
        'ALTER TABLE `testimonials` ADD COLUMN `position` VARCHAR(255) NULL',
      );
    }
    if (!(await queryRunner.hasColumn('testimonials', 'imageUrl'))) {
      await queryRunner.query(
        'ALTER TABLE `testimonials` ADD COLUMN `imageUrl` VARCHAR(500) NULL',
      );
    }
    if (!(await queryRunner.hasColumn('testimonials', 'isActive'))) {
      await queryRunner.query(
        'ALTER TABLE `testimonials` ADD COLUMN `isActive` TINYINT(1) NOT NULL DEFAULT 1',
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('testimonials'))) return;

    if (await queryRunner.hasColumn('testimonials', 'isActive')) {
      await queryRunner.query('ALTER TABLE `testimonials` DROP COLUMN `isActive`');
    }
    if (await queryRunner.hasColumn('testimonials', 'imageUrl')) {
      await queryRunner.query('ALTER TABLE `testimonials` DROP COLUMN `imageUrl`');
    }
    if (await queryRunner.hasColumn('testimonials', 'position')) {
      await queryRunner.query('ALTER TABLE `testimonials` DROP COLUMN `position`');
    }
    const hasContent = await queryRunner.hasColumn('testimonials', 'content');
    const hasText = await queryRunner.hasColumn('testimonials', 'text');
    if (hasContent && !hasText) {
      await queryRunner.query(
        'ALTER TABLE `testimonials` CHANGE COLUMN `content` `text` TEXT NOT NULL',
      );
    }
  }
}

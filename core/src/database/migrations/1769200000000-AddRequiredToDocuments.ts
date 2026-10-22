import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Agrega `documents.required`. La versión original usaba comillas dobles
 * (PostgreSQL) y fallaba en MySQL; ahora es MySQL e idempotente.
 */
export class AddRequiredToDocuments1769200000000 implements MigrationInterface {
  name = 'AddRequiredToDocuments1769200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('documents'))) return;
    if (await queryRunner.hasColumn('documents', 'required')) return;
    await queryRunner.query(
      'ALTER TABLE `documents` ADD COLUMN `required` TINYINT(1) NOT NULL DEFAULT 0',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('documents'))) return;
    if (!(await queryRunner.hasColumn('documents', 'required'))) return;
    await queryRunner.query('ALTER TABLE `documents` DROP COLUMN `required`');
  }
}

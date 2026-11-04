import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Notas internas de propiedades: de un único texto (`internalNotes`) a una lista
 * de notas (`internalNotesLog`, JSON) con autor y fecha.
 *
 * - up: agrega `internalNotesLog` y copia el texto existente como la primera nota
 *   (autor "Nota anterior", fecha = última modificación de la propiedad).
 *   NO borra `internalNotes`: queda como respaldo y para poder revertir.
 * - down: vuelve a dejar en `internalNotes` todas las notas (separadas por una línea
 *   en blanco) y elimina `internalNotesLog`.
 *
 * Idempotente: no repite la columna ni vuelve a copiar propiedades que ya tienen lista.
 */
export class AddPropertyInternalNotesLog1792200000000 implements MigrationInterface {
  name = 'AddPropertyInternalNotesLog1792200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('properties'))) return;

    if (!(await queryRunner.hasColumn('properties', 'internalNotesLog'))) {
      await queryRunner.query(
        'ALTER TABLE `properties` ADD COLUMN `internalNotesLog` JSON NULL',
      );
    }

    if (await queryRunner.hasColumn('properties', 'internalNotes')) {
      await queryRunner.query(`
        UPDATE \`properties\`
        SET \`internalNotesLog\` = JSON_ARRAY(
          JSON_OBJECT(
            'id', UUID(),
            'text', TRIM(\`internalNotes\`),
            'authorId', NULL,
            'authorName', 'Nota anterior',
            'createdAt', DATE_FORMAT(CONVERT_TZ(\`updatedAt\`, @@session.time_zone, '+00:00'), '%Y-%m-%dT%H:%i:%s.000Z')
          )
        )
        WHERE \`internalNotesLog\` IS NULL
          AND \`internalNotes\` IS NOT NULL
          AND TRIM(\`internalNotes\`) <> ''
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('properties'))) return;
    if (!(await queryRunner.hasColumn('properties', 'internalNotesLog'))) return;

    if (await queryRunner.hasColumn('properties', 'internalNotes')) {
      await queryRunner.query(`
        UPDATE \`properties\` p
        SET p.\`internalNotes\` = (
          SELECT GROUP_CONCAT(jt.\`text\` ORDER BY jt.\`ord\` SEPARATOR '\\n\\n')
          FROM JSON_TABLE(
            p.\`internalNotesLog\`,
            '$[*]' COLUMNS (
              \`ord\` FOR ORDINALITY,
              \`text\` TEXT PATH '$.text'
            )
          ) jt
        )
        WHERE p.\`internalNotesLog\` IS NOT NULL
          AND JSON_LENGTH(p.\`internalNotesLog\`) > 0
      `);
    }

    await queryRunner.query(
      'ALTER TABLE `properties` DROP COLUMN `internalNotesLog`',
    );
  }
}

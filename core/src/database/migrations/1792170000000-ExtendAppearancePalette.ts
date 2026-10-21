import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const PALETTE_COLUMNS = [
  { name: 'topBarBackground', default: "'#ffffff'" },
  { name: 'topBarForeground', default: "'#131615'" },
  { name: 'navbarBackground', default: "'#ffffff'" },
  { name: 'navbarForeground', default: "'#131615'" },
  { name: 'footerBackground', default: "'#131615'" },
  { name: 'footerForeground', default: "'#ffffff'" },
] as const;

export class ExtendAppearancePalette1792170000000 implements MigrationInterface {
  name = 'ExtendAppearancePalette1792170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of ['portal_appearances', 'appearance_templates']) {
      for (const column of PALETTE_COLUMNS) {
        if (!(await queryRunner.hasColumn(tableName, column.name))) {
          await queryRunner.addColumn(
            tableName,
            new TableColumn({
              name: column.name,
              type: 'varchar',
              length: '7',
              isNullable: false,
              default: column.default,
            }),
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of ['appearance_templates', 'portal_appearances']) {
      for (const column of [...PALETTE_COLUMNS].reverse()) {
        if (await queryRunner.hasColumn(tableName, column.name)) {
          await queryRunner.dropColumn(tableName, column.name);
        }
      }
    }
  }
}

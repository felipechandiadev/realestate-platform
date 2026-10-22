import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPersonExtraFields1770000000001 implements MigrationInterface {
  name = 'AddPersonExtraFields1770000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('people');
    if (!table) {
      return;
    }

    const hasMaritalStatus = table.columns.some((col) => col.name === 'maritalStatus');
    const hasGender = table.columns.some((col) => col.name === 'gender');
    const hasNationality = table.columns.some((col) => col.name === 'nationality');
    const hasProfession = table.columns.some((col) => col.name === 'profession');
    const hasCompany = table.columns.some((col) => col.name === 'company');

    if (!hasMaritalStatus) {
      await queryRunner.addColumn(
        'people',
        new TableColumn({
          name: 'maritalStatus',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!hasGender) {
      await queryRunner.addColumn(
        'people',
        new TableColumn({
          name: 'gender',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!hasNationality) {
      await queryRunner.addColumn(
        'people',
        new TableColumn({
          name: 'nationality',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!hasProfession) {
      await queryRunner.addColumn(
        'people',
        new TableColumn({
          name: 'profession',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!hasCompany) {
      await queryRunner.addColumn(
        'people',
        new TableColumn({
          name: 'company',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('people');
    if (!table) {
      return;
    }

    if (table.columns.some((col) => col.name === 'company')) {
      await queryRunner.dropColumn('people', 'company');
    }
    if (table.columns.some((col) => col.name === 'profession')) {
      await queryRunner.dropColumn('people', 'profession');
    }
    if (table.columns.some((col) => col.name === 'nationality')) {
      await queryRunner.dropColumn('people', 'nationality');
    }
    if (table.columns.some((col) => col.name === 'gender')) {
      await queryRunner.dropColumn('people', 'gender');
    }
    if (table.columns.some((col) => col.name === 'maritalStatus')) {
      await queryRunner.dropColumn('people', 'maritalStatus');
    }
  }
}

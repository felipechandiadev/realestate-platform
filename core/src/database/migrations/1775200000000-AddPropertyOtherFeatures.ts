import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPropertyOtherFeatures1775200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('properties');
    if (!table) return;
    if (table.findColumnByName('otherFeatures')) return;

    await queryRunner.addColumn(
      'properties',
      new TableColumn({
        name: 'otherFeatures',
        type: 'json',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('properties');
    if (!table?.findColumnByName('otherFeatures')) return;
    await queryRunner.dropColumn('properties', 'otherFeatures');
  }
}

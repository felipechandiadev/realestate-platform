import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRentCommissionSplit1775000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('contracts', [
      new TableColumn({
        name: 'monthlyRent',
        type: 'decimal',
        precision: 18,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'tenantCommissionPercent',
        type: 'double',
        isNullable: true,
      }),
      new TableColumn({
        name: 'tenantCommissionAmount',
        type: 'decimal',
        precision: 18,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'landlordCommissionPercent',
        type: 'double',
        isNullable: true,
      }),
      new TableColumn({
        name: 'landlordCommissionAmount',
        type: 'decimal',
        precision: 18,
        scale: 2,
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('contracts', 'landlordCommissionAmount');
    await queryRunner.dropColumn('contracts', 'landlordCommissionPercent');
    await queryRunner.dropColumn('contracts', 'tenantCommissionAmount');
    await queryRunner.dropColumn('contracts', 'tenantCommissionPercent');
    await queryRunner.dropColumn('contracts', 'monthlyRent');
  }
}

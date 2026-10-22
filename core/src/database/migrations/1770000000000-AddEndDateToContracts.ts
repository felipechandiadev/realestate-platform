import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEndDateToContracts1770000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'contracts',
      new TableColumn({
        name: 'endDate',
        type: 'date',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('contracts', 'endDate');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Índices para los filtros públicos de propiedades (portal):
 * status/operationType/deletedAt, destacadas, región/comuna, moneda/precio,
 * precio y orden por publishedAt/createdAt.
 *
 * MySQL no soporta `CREATE INDEX IF NOT EXISTS`, así que se consulta
 * INFORMATION_SCHEMA.STATISTICS para que la migración sea idempotente
 * (por ejemplo si `synchronize` ya los creó en desarrollo).
 *
 * Los nombres deben coincidir con los @Index de Property.
 */
const TABLE = 'properties';

const INDEXES: Array<{ name: string; columns: string[] }> = [
  { name: 'IDX_properties_status_operation_deleted', columns: ['status', 'operationType', 'deletedAt'] },
  { name: 'IDX_properties_status_featured_deleted', columns: ['status', 'isFeatured', 'deletedAt'] },
  { name: 'IDX_properties_state_city', columns: ['state', 'city'] },
  { name: 'IDX_properties_city', columns: ['city'] },
  { name: 'IDX_properties_currency_price', columns: ['currencyPrice', 'price'] },
  { name: 'IDX_properties_price', columns: ['price'] },
  { name: 'IDX_properties_published_at', columns: ['publishedAt'] },
  { name: 'IDX_properties_created_at', columns: ['createdAt'] },
];

async function indexExists(queryRunner: QueryRunner, name: string): Promise<boolean> {
  const rows: Array<{ total: number | string }> = await queryRunner.query(
    `SELECT COUNT(*) AS total FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [TABLE, name],
  );
  return Number(rows?.[0]?.total ?? 0) > 0;
}

export class AddPublicPropertyIndexes1792180000000 implements MigrationInterface {
  name = 'AddPublicPropertyIndexes1792180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable(TABLE))) return;
    for (const index of INDEXES) {
      if (await indexExists(queryRunner, index.name)) continue;
      const columns = index.columns.map((c) => `\`${c}\``).join(', ');
      await queryRunner.query(`CREATE INDEX \`${index.name}\` ON \`${TABLE}\` (${columns})`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable(TABLE))) return;
    for (const index of [...INDEXES].reverse()) {
      if (!(await indexExists(queryRunner, index.name))) continue;
      await queryRunner.query(`DROP INDEX \`${index.name}\` ON \`${TABLE}\``);
    }
  }
}

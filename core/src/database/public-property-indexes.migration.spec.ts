import { AddPublicPropertyIndexes1792180000000 } from './migrations/1792180000000-AddPublicPropertyIndexes';
import { getMetadataArgsStorage } from 'typeorm';
import { Property } from '../modules/property/domain/property.entity';

function fakeRunner(existing: Set<string>) {
  const executed: string[] = [];
  const runner: any = {
    hasTable: jest.fn().mockResolvedValue(true),
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      if (sql.includes('INFORMATION_SCHEMA.STATISTICS')) {
        return [{ total: existing.has(String(params?.[1])) ? 1 : 0 }];
      }
      executed.push(sql);
      return [];
    }),
  };
  return { runner, executed };
}

describe('AddPublicPropertyIndexes1792180000000', () => {
  const migration = new AddPublicPropertyIndexes1792180000000();

  it('crea solo los índices que faltan (idempotente)', async () => {
    const { runner, executed } = fakeRunner(new Set(['IDX_properties_city']));
    await migration.up(runner);
    expect(executed.every((sql) => sql.startsWith('CREATE INDEX'))).toBe(true);
    expect(executed).toHaveLength(7);
    expect(executed.join('\n')).not.toContain('`IDX_properties_city`');
  });

  it('down elimina solo los existentes', async () => {
    const { runner, executed } = fakeRunner(new Set(['IDX_properties_price', 'IDX_properties_created_at']));
    await migration.down(runner);
    expect(executed).toEqual([
      'DROP INDEX `IDX_properties_created_at` ON `properties`',
      'DROP INDEX `IDX_properties_price` ON `properties`',
    ]);
  });

  it('los nombres coinciden con los @Index de la entidad Property', async () => {
    const entityIndexes = getMetadataArgsStorage()
      .indices.filter((i) => i.target === Property)
      .map((i) => i.name)
      .sort();
    const { runner, executed } = fakeRunner(new Set());
    await migration.up(runner);
    const migrationIndexes = executed.map((sql) => /`(IDX_[^`]+)`/.exec(sql)![1]).sort();
    expect(migrationIndexes).toEqual(entityIndexes);
  });
});

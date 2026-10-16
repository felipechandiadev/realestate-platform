import { applyPublishedPropertyFilters } from './apply-published-property-filters';

function createMockQb() {
  const calls: Array<{ sql: string; params?: Record<string, unknown> }> = [];
  const qb: any = {
    andWhere(sql: string, params?: Record<string, unknown>) {
      calls.push({ sql, params });
      return qb;
    },
  };
  return { qb, calls };
}

describe('applyPublishedPropertyFilters', () => {
  it('applies price min/max', () => {
    const { qb, calls } = createMockQb();
    applyPublishedPropertyFilters(qb, { priceMin: 100, priceMax: 500 });
    expect(calls.some((c) => c.sql.includes('price >=') && c.params?.priceMin === 100)).toBe(true);
    expect(calls.some((c) => c.sql.includes('price <=') && c.params?.priceMax === 500)).toBe(true);
  });

  it('applies multi type ids', () => {
    const { qb, calls } = createMockQb();
    applyPublishedPropertyFilters(qb, { typeIds: 'a,b' });
    expect(calls.some((c) => c.sql.includes('pt.id IN') && (c.params as any)?.typeIds?.length === 2)).toBe(
      true,
    );
  });

  it('applies built/land max', () => {
    const { qb, calls } = createMockQb();
    applyPublishedPropertyFilters(qb, {
      builtSquareMetersMax: 200,
      landSquareMetersMax: 500,
    });
    expect(calls.some((c) => c.sql.includes('builtSquareMeters <=') && c.params?.builtSquareMetersMax === 200)).toBe(
      true,
    );
    expect(calls.some((c) => c.sql.includes('landSquareMeters <=') && c.params?.landSquareMetersMax === 500)).toBe(
      true,
    );
  });

  it('applies otherFeatures as JSON_CONTAINS AND', () => {
    const { qb, calls } = createMockQb();
    applyPublishedPropertyFilters(qb, { otherFeatures: 'POOL,BBQ' });
    const featureCalls = calls.filter((c) => c.sql.includes('JSON_CONTAINS'));
    expect(featureCalls).toHaveLength(2);
  });

  it('ignores empty otherFeatures', () => {
    const { qb, calls } = createMockQb();
    applyPublishedPropertyFilters(qb, { otherFeatures: '' });
    expect(calls.filter((c) => c.sql.includes('JSON_CONTAINS'))).toHaveLength(0);
  });

  it('ignores invalid otherFeature keys', () => {
    const { qb, calls } = createMockQb();
    applyPublishedPropertyFilters(qb, { features: 'NOT_A_KEY,POOL' });
    expect(calls.filter((c) => c.sql.includes('JSON_CONTAINS'))).toHaveLength(1);
  });
});

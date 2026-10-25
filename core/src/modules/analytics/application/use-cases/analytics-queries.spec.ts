import { GetAgentPerformanceUseCase } from './get-agent-performance.usecase';
import { GetDashboardSummaryUseCase } from './get-dashboard-summary.usecase';
import { Property } from '../../../property/domain/property.entity';
import { UserRole } from '../../../users/domain/user.entity';

/** QueryBuilder falso que registra las llamadas y devuelve `raw`/`count`. */
const fakeQb = (
  raw: Record<string, unknown> = {},
  count = 0,
  rawMany: unknown[] = [],
) => {
  const calls: Array<[string, unknown[]]> = [];
  const qb: Record<string, unknown> = {};
  for (const m of [
    'select',
    'addSelect',
    'where',
    'andWhere',
    'innerJoin',
    'leftJoin',
    'groupBy',
  ]) {
    qb[m] = jest.fn((...args: unknown[]) => {
      calls.push([m, args]);
      return qb;
    });
  }
  qb.getRawOne = jest.fn(() => Promise.resolve(raw));
  qb.getCount = jest.fn(() => Promise.resolve(count));
  qb.getRawMany = jest.fn(() => Promise.resolve(rawMany));
  return { qb, calls };
};

describe('GetAgentPerformanceUseCase', () => {
  it('une contratos y propiedades por propertyId (no por una relación inexistente)', async () => {
    const contractQbs: ReturnType<typeof fakeQb>[] = [];
    const contractRepository = {
      createQueryBuilder: jest.fn(() => {
        const q = fakeQb({ total: '0', avgDays: '0' }, 2, []);
        contractQbs.push(q);
        return q.qb;
      }),
    };
    const propertyRepository = {
      createQueryBuilder: jest.fn(() => fakeQb({}, 4, []).qb),
    };
    const userRepository = {
      findOne: jest.fn(() =>
        Promise.resolve({ id: 'a1', name: 'Daniela', role: UserRole.AGENT }),
      ),
    };

    const useCase = new GetAgentPerformanceUseCase(
      userRepository as never,
      propertyRepository as never,
      contractRepository as never,
    );
    const result = await useCase.execute('a1');

    expect(result.agentName).toBe('Daniela');
    const joins = contractQbs.flatMap((q) =>
      q.calls.filter(([m]) => m === 'innerJoin').map(([, a]) => a),
    );
    expect(joins.length).toBeGreaterThan(0);
    for (const args of joins) {
      expect(args).toEqual([
        Property,
        'property',
        'property.id = contract.propertyId',
      ]);
    }
    const selects = contractQbs.flatMap((q) =>
      q.calls.filter(([m]) => m === 'select').map(([, a]) => String(a[0])),
    );
    expect(
      selects.some((sql) => sql.includes("contract.currency = 'UF'")),
    ).toBe(true);
    expect(selects.some((sql) => sql.includes('contract.endDate'))).toBe(true);
    // MySQL con only_full_group_by exige agrupar al contar por operación.
    const groupBys = contractQbs.flatMap((q) => q.calls.filter(([m]) => m === 'groupBy').map(([, a]) => a[0]));
    expect(groupBys).toContain('contract.operation');
  });
});

describe('GetDashboardSummaryUseCase', () => {
  it('calcula ingresos en CLP, variación contra el mes anterior y el mismo mes del año anterior', async () => {
    // Orden de las consultas de ingresos: este mes, mes anterior, mismo mes año anterior, luego la tendencia.
    const revenues = [1_000_000, 800_000, 500_000, 0, 0, 0, 0, 0, 1_000_000];
    const paymentQbs: ReturnType<typeof fakeQb>[] = [];
    const paymentRepository = {
      createQueryBuilder: jest.fn(() => {
        const q = fakeQb({ total: String(revenues[paymentQbs.length] ?? 0) });
        paymentQbs.push(q);
        return q.qb;
      }),
    };
    const memberCounts = [6, 3];
    let userCalls = 0;
    const userRepository = {
      createQueryBuilder: jest.fn(
        () => fakeQb({}, memberCounts[userCalls++] ?? 0).qb,
      ),
    };
    const propertyRepository = {
      createQueryBuilder: jest.fn(() => fakeQb({}, 24, []).qb),
    };
    const contractQb = fakeQb({ avgDays: '30' });
    const contractRepository = {
      createQueryBuilder: jest.fn(() => contractQb.qb),
    };
    const agents = { execute: jest.fn(() => Promise.resolve([])) };

    const useCase = new GetDashboardSummaryUseCase(
      propertyRepository as never,
      contractRepository as never,
      userRepository as never,
      paymentRepository as never,
      agents as never,
    );
    const summary = (await useCase.execute()) as Record<string, unknown>;

    expect(summary.rawTotalRevenueThisMonth).toBe(1_000_000);
    expect(summary.variations).toEqual({ revenue: 25, newMembers: 100 });
    expect(summary.previousYearSameMonth).toBe(0.5);
    expect(summary).not.toHaveProperty('agencyPaymentsCountThisMonth');

    const firstPaymentQuery = paymentQbs[0].calls;
    expect(firstPaymentQuery).toContainEqual(['leftJoin', ['p.contract', 'c']]);
    expect(
      String(firstPaymentQuery.find(([m]) => m === 'select')?.[1][0]),
    ).toContain("p.currency = 'UF'");

    const closureFilters = contractQb.calls
      .filter(([m]) => m === 'andWhere')
      .map(([, a]) => String(a[0]));
    expect(closureFilters).toEqual(
      expect.arrayContaining([
        'contract.operation = :operation',
        'contract.endDate IS NOT NULL',
      ]),
    );
  });
});

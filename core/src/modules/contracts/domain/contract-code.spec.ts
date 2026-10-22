/** Tests unitarios de la generación de código de contrato (reemplaza el monkey-patch). */
import { ensureContractCode, generateContractCode } from './contract-code';

describe('generateContractCode', () => {
  it('formato C-<epoch>-<6 hex> y cabe en varchar(64)', () => {
    const code = generateContractCode(1761170000000);
    expect(code).toMatch(/^C-1761170000000-[0-9a-f]{6}$/);
    expect(code.length).toBeLessThanOrEqual(64);
  });

  it('dos códigos generados en el mismo ms son distintos (sufijo aleatorio)', () => {
    const codes = new Set(
      Array.from({ length: 50 }, () => generateContractCode(1)),
    );
    expect(codes.size).toBeGreaterThan(45);
  });
});

describe('ensureContractCode', () => {
  it('asigna código solo si falta', () => {
    const a: { code?: string | null } = {};
    ensureContractCode(a);
    expect(a.code).toMatch(/^C-\d+-[0-9a-f]{6}$/);

    const b = { code: 'EXISTENTE' };
    expect(ensureContractCode(b).code).toBe('EXISTENTE');

    const c: { code?: string | null } = { code: null };
    expect(ensureContractCode(c).code).toMatch(/^C-/);
  });

  it('tolera null/undefined', () => {
    expect(ensureContractCode(undefined as any)).toBeUndefined();
  });
});

describe('ContractOrmEntity @BeforeInsert', () => {
  it('genera código al insertar si no viene', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {
      ContractOrmEntity,
    } = require('../infrastructure/persistence/contract.orm-entity');
    const orm = new ContractOrmEntity();
    orm.ensureCode();
    expect(orm.code).toMatch(/^C-\d+-[0-9a-f]{6}$/);
    orm.code = 'FIJO';
    orm.ensureCode();
    expect(orm.code).toBe('FIJO');
  });
});

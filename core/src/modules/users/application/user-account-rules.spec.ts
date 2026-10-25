import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserRole, UserStatus } from '../domain/user.entity';
import { assertAccountChangeAllowed, type AccountChangeContext } from './user-account-rules';

const ctx = (over: Partial<AccountChangeContext> = {}): AccountChangeContext => ({
  actorId: 'admin-1',
  target: { id: 'user-2', role: UserRole.AGENT, status: UserStatus.ACTIVE },
  otherActiveAdmins: 1,
  assignedProperties: 0,
  activeContracts: 0,
  ...over,
});
const adminTarget = { id: 'admin-2', role: UserRole.ADMIN, status: UserStatus.ACTIVE };

describe('assertAccountChangeAllowed', () => {
  it('nadie puede quitarse acceso a sí mismo', () => {
    const self = ctx({ actorId: 'admin-1', target: { ...adminTarget, id: 'admin-1' } });
    for (const change of [
      { kind: 'status', status: UserStatus.INACTIVE },
      { kind: 'role', role: UserRole.AGENT },
      { kind: 'delete' },
    ] as const) {
      expect(() => assertAccountChangeAllowed(change, self)).toThrow(BadRequestException);
    }
    // Reafirmar su propio estado activo o su rol actual no le quita acceso.
    expect(() => assertAccountChangeAllowed({ kind: 'status', status: UserStatus.ACTIVE }, self)).not.toThrow();
    expect(() => assertAccountChangeAllowed({ kind: 'role', role: UserRole.ADMIN }, self)).not.toThrow();
  });

  it('siempre queda al menos un administrador activo', () => {
    const last = ctx({ target: adminTarget, otherActiveAdmins: 0 });
    expect(() => assertAccountChangeAllowed({ kind: 'delete' }, last)).toThrow(
      'Debe quedar al menos un administrador activo.',
    );
    expect(() => assertAccountChangeAllowed({ kind: 'role', role: UserRole.AGENT }, last)).toThrow(BadRequestException);
    expect(() =>
      assertAccountChangeAllowed({ kind: 'status', status: UserStatus.VACATION }, last),
    ).toThrow(BadRequestException);

    expect(() => assertAccountChangeAllowed({ kind: 'delete' }, ctx({ target: adminTarget, otherActiveAdmins: 1 }))).not.toThrow();
  });

  it('un agente con propiedades o contratos no se desactiva ni elimina', () => {
    const busy = ctx({ assignedProperties: 2, activeContracts: 1 });
    expect(() => assertAccountChangeAllowed({ kind: 'delete' }, busy)).toThrow(ConflictException);
    expect(() => assertAccountChangeAllowed({ kind: 'status', status: UserStatus.INACTIVE }, busy)).toThrow(
      'El usuario tiene 2 propiedad(es) asignada(s) y 1 contrato(s) en proceso. Reasígnalos antes de desactivarlo.',
    );
    // Vacaciones o licencia no lo sacan del trabajo asignado.
    expect(() =>
      assertAccountChangeAllowed({ kind: 'status', status: UserStatus.VACATION }, busy),
    ).not.toThrow();
  });

  it('permite cambios normales sobre otros usuarios', () => {
    expect(() => assertAccountChangeAllowed({ kind: 'delete' }, ctx())).not.toThrow();
    expect(() => assertAccountChangeAllowed({ kind: 'role', role: UserRole.ADMIN }, ctx())).not.toThrow();
  });
});

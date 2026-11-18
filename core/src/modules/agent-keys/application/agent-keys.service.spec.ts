import { UnauthorizedException } from '@nestjs/common';
import { AgentKeysService } from './agent-keys.service';
import { AgentScope } from '../domain/agent-key.entity';
import { UserRole, UserStatus } from '../../users/domain/user.entity';

function setup(owner: any = { id: 'u1', email: 'a@x.cl', role: UserRole.ADMIN, status: UserStatus.ACTIVE }) {
  const rows: any[] = [];
  const keys: any = {
    create: (v: any) => ({ id: `k${rows.length + 1}`, ...v }),
    save: async (v: any) => { if (!rows.includes(v)) rows.push(v); return v; },
    findOne: async ({ where }: any) => rows.find((r) => (where.keyPrefix ? r.keyPrefix === where.keyPrefix : r.id === where.id)) ?? null,
    update: async () => undefined,
    find: async () => rows,
  };
  const users: any = { findOne: async () => owner };
  return { svc: new AgentKeysService(keys, users), rows };
}

describe('AgentKeysService', () => {
  it('crea la key, guarda solo el hash y la autentica', async () => {
    const { svc, rows } = setup();
    const { token, key } = await svc.create({ ownerId: 'u1', name: 'Grok', scopes: [AgentScope.PROPERTIES_WRITE] });
    expect(token.startsWith('rek_')).toBe(true);
    expect(JSON.stringify(rows)).not.toContain(token);
    expect(key.scopes).toContain(AgentScope.PROPERTIES_READ); // escribir implica leer
    const who = await svc.authenticate(token);
    expect(who).toMatchObject({ id: 'u1', role: UserRole.ADMIN, authAudience: 'staff' });
    expect(who.agent.name).toBe('Grok');
  });

  it('rechaza key alterada, revocada, vencida o de un admin inactivo', async () => {
    const { svc, rows } = setup();
    const { token, key } = await svc.create({ ownerId: 'u1', name: 'A', scopes: [AgentScope.PROPERTIES_READ] });
    await expect(svc.authenticate(token.slice(0, -2) + 'xx')).rejects.toThrow(UnauthorizedException);
    rows[0].expiresAt = new Date(Date.now() - 1000);
    await expect(svc.authenticate(token)).rejects.toThrow(/venció/);
    rows[0].expiresAt = null;
    await svc.revoke(key.id, { id: 'u1', role: UserRole.ADMIN });
    await expect(svc.authenticate(token)).rejects.toThrow(/revocada/);

    const inactive = setup({ id: 'u1', email: 'a', role: UserRole.ADMIN, status: UserStatus.INACTIVE });
    const t = await inactive.svc.create({ ownerId: 'u1', name: 'B', scopes: [AgentScope.PROPERTIES_READ] });
    await expect(inactive.svc.authenticate(t.token)).rejects.toThrow(UnauthorizedException);
  });

  it('no deja revocar la key de otro admin ni crear sin permisos válidos', async () => {
    const { svc } = setup();
    const { key } = await svc.create({ ownerId: 'u1', name: 'A', scopes: [AgentScope.PROPERTIES_READ] });
    await expect(svc.revoke(key.id, { id: 'otro', role: UserRole.ADMIN })).rejects.toThrow(/no encontrado/);
    await expect(svc.create({ ownerId: 'u1', name: 'A', scopes: [] })).rejects.toThrow();
    await expect(svc.create({ ownerId: 'u1', name: 'A', scopes: ['x' as any] })).rejects.toThrow(/no válidos/);
  });
});

import { ForbiddenException } from '@nestjs/common';
import { AgentAccessGuard } from './agent-access.guard';
import { AgentScope } from '../../../agent-keys/domain/agent-key.entity';

const ctx = (req: any) =>
  ({
    getType: () => 'http',
    getHandler: () => null,
    getClass: () => null,
    switchToHttp: () => ({ getRequest: () => req }),
  }) as any;
const guard = new AgentAccessGuard({ getAllAndOverride: () => false } as any);
const agent = (scopes: AgentScope[]) => ({ agent: { keyId: 'k', name: 'Bot', scopes } });
const R = AgentScope.PROPERTIES_READ, W = AgentScope.PROPERTIES_WRITE, P = AgentScope.PROPERTIES_PUBLISH;

describe('AgentAccessGuard', () => {
  it('no afecta a las personas', () => {
    expect(guard.canActivate(ctx({ user: { id: 'u' }, path: '/users', method: 'DELETE' }))).toBe(true);
  });
  it('limita a propiedades, multimedia y catálogos', () => {
    expect(guard.canActivate(ctx({ user: agent([R]), path: '/agent/catalogs', method: 'GET' }))).toBe(true);
    expect(() => guard.canActivate(ctx({ user: agent([R, W]), path: '/users', method: 'GET' }))).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx({ user: agent([R, W]), path: '/agent-keys', method: 'GET' }))).toThrow(ForbiddenException);
  });
  it('deja pasar /mcp con cualquier permiso (las herramientas se validan al reenviar)', () => {
    expect(guard.canActivate(ctx({ user: agent([R]), path: '/mcp', method: 'POST', body: {} }))).toBe(true);
  });
  it('nunca deja eliminar y exige write para escribir', () => {
    expect(() => guard.canActivate(ctx({ user: agent([R, W, P]), path: '/properties/1', method: 'DELETE' }))).toThrow(/eliminar/);
    expect(() => guard.canActivate(ctx({ user: agent([R]), path: '/properties/1/price', method: 'PATCH' }))).toThrow(/properties:write/);
  });
  it('exige properties:publish para dejar PUBLISHED', () => {
    const req = (scopes: AgentScope[]) => ({ user: agent(scopes), path: '/properties/1/basic', method: 'PATCH', body: { status: 'PUBLISHED' } });
    expect(() => guard.canActivate(ctx(req([R, W])))).toThrow(/publicar/);
    expect(guard.canActivate(ctx(req([R, W, P])))).toBe(true);
  });
});

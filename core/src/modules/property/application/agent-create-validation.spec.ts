import { agentCreateErrors, assertAgentCreatePayload } from './agent-create-validation';

const ok = { title: 'Casa', status: 'REQUEST', operationType: 'SALE', state: 'Metropolitana de Santiago', city: 'Providencia', price: 100, currencyPrice: 'UF' };

describe('agentCreateErrors', () => {
  it('acepta un payload válido', () => expect(agentCreateErrors(ok)).toEqual([]));
  it('no corrige en silencio valores inválidos', () => {
    const e = agentCreateErrors({ ...ok, status: 'PUBLICADA', operationType: 'VENTA', currencyPrice: 'USD' });
    expect(e.join('|')).toMatch(/status/);
    expect(e.join('|')).toMatch(/operationType/);
    expect(e.join('|')).toMatch(/currencyPrice/);
  });
  it('rechaza campos desconocidos y comuna de otra región', () => {
    expect(agentCreateErrors({ ...ok, titulo: 'x' }).join()).toMatch(/desconocidos: titulo/);
    expect(agentCreateErrors({ ...ok, city: 'Arica' }).join()).toMatch(/comuna de la región/);
  });
  it('exige moneda con precio y CLP entero', () => {
    const { currencyPrice, ...noCur } = ok;
    expect(agentCreateErrors(noCur).join()).toMatch(/currencyPrice: obligatorio/);
    expect(agentCreateErrors({ ...ok, currencyPrice: 'CLP', price: 10.5 }).join()).toMatch(/entero/);
  });
  it('exige agente asignado para PUBLISHED / PRE-APPROVED y valida su formato', () => {
    expect(agentCreateErrors({ ...ok, status: 'PUBLISHED' }).join()).toMatch(/assignedAgentId: obligatorio/);
    expect(agentCreateErrors({ ...ok, status: 'PRE-APPROVED' }).join()).toMatch(/assignedAgentId: obligatorio/);
    expect(agentCreateErrors({ ...ok, status: 'PUBLISHED', assignedAgentId: 'no-uuid' }).join()).toMatch(/id de un agente/);
    expect(agentCreateErrors({ ...ok, status: 'PUBLISHED', assignedAgentId: '11111111-1111-4111-8111-111111111111' })).toEqual([]);
  });
  it('bloquea publicar sin permiso', () => {
    const user = { agent: { keyId: 'k', name: 'b', scopes: ['properties:read', 'properties:write'] } };
    expect(() => assertAgentCreatePayload({ ...ok, status: 'PUBLISHED', assignedAgentId: '11111111-1111-4111-8111-111111111111' }, user)).toThrow(/publicar/);
    expect(() => assertAgentCreatePayload(ok, user)).not.toThrow();
  });
});

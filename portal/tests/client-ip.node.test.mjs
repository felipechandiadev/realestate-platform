import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { clientIpFrom, CLIENT_IP_HEADER } from '../lib/client-ip-core.ts';

const source = (values) => ({ get: (name) => values[name] ?? null });

describe('clientIpFrom', () => {
  it('toma la primera IP de X-Forwarded-For (la del visitante)', () => {
    assert.equal(clientIpFrom(source({ 'x-forwarded-for': '203.0.113.50, 10.0.0.1' })), '203.0.113.50');
  });

  it('usa X-Real-IP si no hay X-Forwarded-For', () => {
    assert.equal(clientIpFrom(source({ 'x-real-ip': '198.51.100.7' })), '198.51.100.7');
  });

  it('devuelve null sin cabeceras', () => {
    assert.equal(clientIpFrom(source({})), null);
    assert.equal(CLIENT_IP_HEADER, 'x-client-ip');
  });
});

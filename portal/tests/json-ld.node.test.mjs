import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { serializeJsonLd } from '../shared/lib/json-ld.ts';

describe('serializeJsonLd', () => {
  const malicious = { name: 'QA </script><script>window.__xss=1</script> & <b>' };

  it('no deja cerrar la etiqueta <script> ni abrir otra', () => {
    const out = serializeJsonLd(malicious);
    assert.ok(!out.includes('</script>'), out);
    assert.ok(!out.includes('<'), out);
    assert.ok(!out.includes('>'), out);
  });

  it('produce un JSON equivalente al original', () => {
    const data = { ...malicious, line: 'a\u2028b\u2029c', price: 1500, nested: { ok: true } };
    assert.deepEqual(JSON.parse(serializeJsonLd(data)), data);
  });
});

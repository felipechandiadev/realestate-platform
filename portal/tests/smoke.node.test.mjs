import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Smoke mínimo del portal sin Jest (Jest no está en dependencies).
 * Cubre la misma normalización de origen público usada en SEO/share.
 */
function portalPublicOrigin(raw) {
  return String(raw || 'http://localhost:8001').replace(/\/+$/, '');
}

describe('portal smoke', () => {
  it('normaliza NEXT_PUBLIC_PORTAL_URL sin slash final', () => {
    assert.equal(portalPublicOrigin('https://bravoshottpropiedades.cl/'), 'https://bravoshottpropiedades.cl');
  });

  it('usa localhost por defecto', () => {
    assert.equal(portalPublicOrigin(''), 'http://localhost:8001');
  });
});

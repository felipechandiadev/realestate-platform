import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { portalPublicOrigin, pageMetadata, metaDescription } from '../shared/lib/seo-core.ts';
import { buildSitemapEntries, sitemapRowsFrom } from '../shared/lib/sitemap-core.ts';

const ORIGIN = 'https://bravoshottpropiedades.cl';

describe('portalPublicOrigin', () => {
  it('prefiere NEXT_PUBLIC_PORTAL_URL y quita la barra final', () => {
    assert.equal(
      portalPublicOrigin({ NEXT_PUBLIC_PORTAL_URL: `${ORIGIN}/`, NEXTAUTH_URL: 'http://otro' }),
      ORIGIN,
    );
  });

  it('cae en NEXTAUTH_URL y luego en localhost', () => {
    assert.equal(portalPublicOrigin({ NEXTAUTH_URL: ORIGIN }), ORIGIN);
    assert.equal(portalPublicOrigin({}), 'http://localhost:8001');
  });
});

describe('pageMetadata', () => {
  it('arma canonical y Open Graph con la URL absoluta de la página', () => {
    const meta = pageMetadata({ path: '/aboutUs', title: 'Nosotros', description: 'Quiénes somos' }, ORIGIN);
    assert.equal(meta.title, 'Nosotros');
    assert.equal(meta.description, 'Quiénes somos');
    assert.equal(meta.alternates.canonical, `${ORIGIN}/aboutUs`);
    assert.equal(meta.openGraph.url, `${ORIGIN}/aboutUs`);
    assert.equal(meta.openGraph.locale, 'es_CL');
  });

  it('la portada usa el origen con barra', () => {
    const meta = pageMetadata({ path: '/', title: 'Inicio', description: 'x' }, ORIGIN);
    assert.equal(meta.alternates.canonical, `${ORIGIN}/`);
  });
});

describe('metaDescription', () => {
  it('quita HTML, colapsa espacios y recorta a 160 caracteres', () => {
    assert.equal(metaDescription('<p>Hola   <b>mundo</b></p>'), 'Hola mundo');
    const long = metaDescription('a'.repeat(300));
    assert.equal(long.length, 160);
    assert.ok(long.endsWith('…'));
    assert.equal(metaDescription(null), '');
  });
});

describe('sitemap', () => {
  it('lee filas desde array o { data }', () => {
    assert.deepEqual(sitemapRowsFrom([{ id: 1 }]).map((r) => r.id), ['1']);
    assert.deepEqual(sitemapRowsFrom({ data: [{ id: 'a' }, { nope: 1 }] }).map((r) => r.id), ['a']);
    assert.deepEqual(sitemapRowsFrom(null), []);
  });

  it('incluye páginas fijas, propiedades y artículos del blog', () => {
    const now = new Date('2026-10-26T00:00:00Z');
    const entries = buildSitemapEntries(
      ORIGIN,
      [{ id: 'p1', updatedAt: '2026-10-01' }],
      [{ id: 'a1', createdAt: '2026-09-01' }],
      now,
    );
    const urls = entries.map((e) => e.url);
    assert.ok(urls.includes(`${ORIGIN}/`));
    assert.ok(urls.includes(`${ORIGIN}/services/management`));
    assert.ok(urls.includes(`${ORIGIN}/properties/property/p1`));
    assert.ok(urls.includes(`${ORIGIN}/blog/article/a1`));
    assert.equal(entries.find((e) => e.url.endsWith('/a1')).lastModified, '2026-09-01');
    assert.ok(urls.every((u) => u.startsWith(ORIGIN)));
    assert.ok(!urls.some((u) => /myContracts|personalInfo|publish$/.test(u)));
  });
});

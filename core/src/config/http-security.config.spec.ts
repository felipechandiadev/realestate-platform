/** Tests unitarios de CORS / Swagger / helmet (sin servidor). */
import {
  DEFAULT_PRODUCTION_ORIGINS,
  LOCAL_DEV_ORIGINS,
  buildHelmetOptions,
  isSwaggerEnabled,
  resolveCorsOrigins,
} from './http-security.config';

describe('resolveCorsOrigins', () => {
  it('producción sin CORS_ORIGINS: dominios de producción, sin localhost', () => {
    const origins = resolveCorsOrigins({
      NODE_ENV: 'production',
      PORTAL_URL: 'http://localhost:8001',
    });
    expect(origins).toEqual(DEFAULT_PRODUCTION_ORIGINS);
  });

  it('producción con CORS_ORIGINS: usa la lista y descarta localhost', () => {
    const origins = resolveCorsOrigins({
      NODE_ENV: 'production',
      CORS_ORIGINS: 'https://a.cl/, https://b.cl,,http://localhost:3000',
    });
    expect(origins).toEqual(['https://a.cl', 'https://b.cl']);
  });

  it('desarrollo: agrega orígenes localhost', () => {
    const origins = resolveCorsOrigins({ NODE_ENV: 'development' });
    for (const o of [...DEFAULT_PRODUCTION_ORIGINS, ...LOCAL_DEV_ORIGINS]) {
      expect(origins).toContain(o);
    }
  });
});

describe('isSwaggerEnabled / helmet', () => {
  it('Swagger apagado solo en producción', () => {
    expect(isSwaggerEnabled({ NODE_ENV: 'production' })).toBe(false);
    expect(isSwaggerEnabled({ NODE_ENV: 'development' })).toBe(true);
    expect(isSwaggerEnabled({})).toBe(true);
  });

  it('CORP cross-origin para que el portal cargue imágenes; CSP solo en producción', () => {
    const dev = buildHelmetOptions({ NODE_ENV: 'development' });
    const prod = buildHelmetOptions({ NODE_ENV: 'production' });
    expect(dev.crossOriginResourcePolicy).toEqual({ policy: 'cross-origin' });
    expect(prod.crossOriginResourcePolicy).toEqual({ policy: 'cross-origin' });
    expect(dev.contentSecurityPolicy).toBe(false);
    expect(prod.contentSecurityPolicy).toBeUndefined();
  });
});

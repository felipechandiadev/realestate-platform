import {
  buildMysqlBaseOptions,
  isLocalDbHost,
  parseBooleanFlag,
  resolveSynchronize,
} from './database-options';

const envOf = (vars: Record<string, string | undefined>) => (key: string) => vars[key];

describe('resolveSynchronize', () => {
  it('production: siempre false', () => {
    expect(resolveSynchronize(envOf({ NODE_ENV: 'production' }))).toBe(false);
    expect(resolveSynchronize(envOf({ NODE_ENV: 'production', DB_SYNCHRONIZE: 'false' }))).toBe(false);
  });

  it('production + DB_SYNCHRONIZE=true: falla al arrancar', () => {
    expect(() =>
      resolveSynchronize(envOf({ NODE_ENV: 'production', DB_SYNCHRONIZE: 'true' })),
    ).toThrow(/no está permitido/);
  });

  it('entorno vacío o desconocido + DB_SYNCHRONIZE=true: falla', () => {
    expect(() => resolveSynchronize(envOf({ DB_SYNCHRONIZE: '1' }))).toThrow(/no está permitido/);
    expect(() =>
      resolveSynchronize(envOf({ NODE_ENV: 'staging', DB_SYNCHRONIZE: 'yes' })),
    ).toThrow(/no está permitido/);
    expect(resolveSynchronize(envOf({ NODE_ENV: 'staging' }))).toBe(false);
  });

  it('development: false salvo DB_SYNCHRONIZE=true', () => {
    expect(resolveSynchronize(envOf({ NODE_ENV: 'development' }))).toBe(false);
    expect(resolveSynchronize(envOf({ NODE_ENV: 'development', DB_SYNCHRONIZE: 'true' }))).toBe(true);
  });

  it('test: true por defecto, desactivable', () => {
    expect(resolveSynchronize(envOf({ NODE_ENV: 'test' }))).toBe(true);
    expect(resolveSynchronize(envOf({ NODE_ENV: 'test', DB_SYNCHRONIZE: 'false' }))).toBe(false);
  });

  it('valor inválido: error explícito', () => {
    expect(() => parseBooleanFlag('DB_SYNCHRONIZE', 'quizas')).toThrow(/inválido/);
  });
});

describe('buildMysqlBaseOptions', () => {
  it('lee las mismas variables DB_* y mapea localhost a 127.0.0.1', () => {
    const opts = buildMysqlBaseOptions(
      envOf({ DB_HOST: 'localhost', DB_PORT: '3307', DB_USERNAME: 'u', DB_PASSWORD: 'p', DB_DATABASE: 'x_dev' }),
    );
    expect(opts).toMatchObject({ type: 'mysql', host: '127.0.0.1', port: 3307, username: 'u', database: 'x_dev' });
  });

  it('isLocalDbHost', () => {
    expect(isLocalDbHost('127.0.0.1')).toBe(true);
    expect(isLocalDbHost('mysql-prod.aivencloud.com')).toBe(false);
  });
});

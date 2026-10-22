/** Tests unitarios (DataSource mockeado, sin BD) del admin de pruebas. */
import {
  TestAdminModule,
  TestAdminService,
  isTestAdminEnabled,
} from './test-admin.module';

describe('TestAdminModule', () => {
  it('solo se habilita con NODE_ENV=test y ENABLE_TEST_ADMIN=true', () => {
    expect(
      isTestAdminEnabled({ NODE_ENV: 'test', ENABLE_TEST_ADMIN: 'true' }),
    ).toBe(true);
    expect(isTestAdminEnabled({ NODE_ENV: 'test' })).toBe(false);
    expect(
      isTestAdminEnabled({ NODE_ENV: 'production', ENABLE_TEST_ADMIN: 'true' }),
    ).toBe(false);
    expect(
      TestAdminModule.register({
        NODE_ENV: 'production',
        ENABLE_TEST_ADMIN: 'true',
      }).providers,
    ).toEqual([]);
    expect(
      TestAdminModule.register({ NODE_ENV: 'test', ENABLE_TEST_ADMIN: 'true' })
        .providers,
    ).toEqual([TestAdminService]);
  });

  describe('TestAdminService', () => {
    const saved = { ...process.env };
    const repo = {
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    const dataSource = { getRepository: jest.fn(() => repo) };

    beforeEach(() => {
      jest.clearAllMocks();
      process.env.NODE_ENV = 'test';
      process.env.ENABLE_TEST_ADMIN = 'true';
    });
    afterAll(() => {
      process.env = saved;
    });

    it('sin contraseña o con contraseña corta no crea nada', async () => {
      delete process.env.TEST_ADMIN_PASSWORD;
      await new TestAdminService(dataSource as any).onModuleInit();
      process.env.TEST_ADMIN_PASSWORD = 'corta';
      await new TestAdminService(dataSource as any).onModuleInit();
      expect(dataSource.getRepository).not.toHaveBeenCalled();
    });

    it('con contraseña larga guarda hash bcrypt, nunca texto plano', async () => {
      process.env.TEST_ADMIN_PASSWORD = 'una-clave-larga-de-prueba';
      await new TestAdminService(dataSource as any).onModuleInit();
      expect(repo.save).toHaveBeenCalledTimes(1);
      const saved = repo.save.mock.calls[0][0];
      expect(saved.password).not.toBe('una-clave-larga-de-prueba');
      expect(saved.password).toMatch(/^\$2[aby]\$12\$/);
    });
  });
});

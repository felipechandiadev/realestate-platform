import {
  DynamicModule,
  Injectable,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * Crea un admin de pruebas SOLO cuando:
 *   NODE_ENV === 'test'  Y  ENABLE_TEST_ADMIN === 'true'
 * La contraseña se lee de TEST_ADMIN_PASSWORD (mínimo 12 caracteres);
 * no hay contraseña por defecto.
 */
export function isTestAdminEnabled(env: NodeJS.ProcessEnv = process.env) {
  return env.NODE_ENV === 'test' && env.ENABLE_TEST_ADMIN === 'true';
}

export const TEST_ADMIN_MIN_PASSWORD_LENGTH = 12;

@Injectable()
export class TestAdminService implements OnModuleInit {
  private readonly logger = new Logger(TestAdminService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (!isTestAdminEnabled()) return;
    const password = process.env.TEST_ADMIN_PASSWORD ?? '';
    if (password.length < TEST_ADMIN_MIN_PASSWORD_LENGTH) {
      this.logger.warn(
        `TEST_ADMIN_PASSWORD ausente o con menos de ${TEST_ADMIN_MIN_PASSWORD_LENGTH} caracteres; no se crea el admin de pruebas.`,
      );
      return;
    }
    const email = process.env.TEST_ADMIN_EMAIL || 'admin@realestate.com';
    try {
      const repo = this.dataSource.getRepository('users');
      const existing = await repo.findOne({ where: { email } });
      if (!existing) {
        const hash = await bcrypt.hash(password, 12);
        await repo.save({
          username: 'admin',
          email,
          password: hash,
          role: 'ADMIN',
          status: 'ACTIVE',
        } as any);
        this.logger.log('Admin de pruebas creado');
      }
    } catch (e) {
      this.logger.error(
        `No se pudo crear el admin de pruebas: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }
}

@Module({})
export class TestAdminModule {
  /** Devuelve el módulo con el servicio solo si está habilitado; si no, un módulo vacío. */
  static register(env: NodeJS.ProcessEnv = process.env): DynamicModule {
    return {
      module: TestAdminModule,
      providers: isTestAdminEnabled(env) ? [TestAdminService] : [],
    };
  }
}

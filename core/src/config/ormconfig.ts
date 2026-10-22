import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { entities as explicitEntities } from './entities';
import { buildMysqlBaseOptions, EnvGetter, resolveSynchronize } from './database-options';

export const ormConfig = (
	configService: ConfigService,
): TypeOrmModuleOptions => {
	const get: EnvGetter = (key) => {
		const value = configService.get<string | number>(key);
		return value === undefined || value === null ? undefined : String(value);
	};

	// Use an absolute glob based on cwd so Jest/ts-jest can resolve entity files
	const projectRoot = process.cwd();
	// Prefer an explicit entities list when available (more robust for tests)
	const entitiesGlob: string[] | any[] = explicitEntities && explicitEntities.length > 0
		? explicitEntities
		: [join(projectRoot, 'backend', 'src', '**', '*.entity{.ts,.js}')];

	// Única carpeta de migraciones: src/database/migrations (dist/database/migrations en build).
	const migrationsGlob = [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')];

	return {
		...buildMysqlBaseOptions(get),
		entities: entitiesGlob,
		// synchronize: solo test (por defecto) o development con DB_SYNCHRONIZE=true.
		// En producción lanza error si DB_SYNCHRONIZE=true (fail-fast). Ver database-options.ts.
		synchronize: resolveSynchronize(get),
		logging: get('NODE_ENV') === 'development',
		migrations: migrationsGlob,
		// Las migraciones se ejecutan solo de forma explícita (npm run migration:run).
		migrationsRun: false,
	};
};

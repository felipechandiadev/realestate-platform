import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2';
import { join } from 'path';
import { entities as explicitEntities } from './entities';

export const ormConfig = (
	configService: ConfigService,
): TypeOrmModuleOptions => {
	// Use an absolute glob based on cwd so Jest/ts-jest can resolve entity files
	const projectRoot = process.cwd();
	// Prefer an explicit entities list when available (more robust for tests)
	const entitiesGlob: string[] | any[] = explicitEntities && explicitEntities.length > 0
		? explicitEntities
		: [join(projectRoot, 'backend', 'src', '**', '*.entity{.ts,.js}')];

	const migrationsGlob = [join(projectRoot, 'backend', 'src', 'database', 'migrations', '*{.ts,.js}')];

	return {
		type: 'mysql',
		connectorPackage: 'mysql2',
		host:
			configService.get<string>('DB_HOST') === 'localhost'
				? '127.0.0.1'
				: configService.get<string>('DB_HOST'),
		port: configService.get<number>('DB_PORT'),
		username: configService.get<string>('DB_USERNAME'),
		password: configService.get<string>('DB_PASSWORD'),
		database: configService.get<string>('DB_DATABASE'),
		entities: entitiesGlob,
		// Enable schema synchronization in development and test environments
		synchronize: ['development', 'test'].includes(
			(configService.get<string>('NODE_ENV') || '') as string,
		),
		logging: configService.get<string>('NODE_ENV') === 'development',
		migrations: migrationsGlob,
		migrationsRun: false,
		driver: mysql,
		extra: {
			connectionLimit: 30,
			enableKeepAlive: true,
			keepAliveInitialDelayMs: 0,
			decimalNumbers: true,
			supportBigNumbers: true,
		},
	};
};

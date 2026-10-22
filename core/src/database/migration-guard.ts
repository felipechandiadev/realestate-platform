import { DbTarget, isLocalDbHost } from '../config/database-options';

/**
 * Guardia para la CLI de migraciones. Pura (no conecta): decide si un
 * comando puede ejecutarse contra el destino indicado.
 *
 * Los comandos que modifican o leen el esquema real (run, revert, generate)
 * exigen CONFIRM_MIGRATION=yes cuando NODE_ENV=production o el host de la BD
 * no es local. `show` solo lee la tabla `migrations` y no pide confirmación.
 */
export const MIGRATION_COMMANDS = ['run', 'revert', 'show', 'generate'] as const;
export type MigrationCommand = (typeof MIGRATION_COMMANDS)[number];

export const CONFIRM_MIGRATION_VALUE = 'yes';
const COMMANDS_REQUIRING_CONFIRMATION: MigrationCommand[] = ['run', 'revert', 'generate'];

export function isMigrationCommand(value: string): value is MigrationCommand {
  return (MIGRATION_COMMANDS as readonly string[]).includes(value);
}

/** Descripción del destino SIN credenciales (nunca usuario ni contraseña). */
export function describeMigrationTarget(
  command: MigrationCommand,
  target: DbTarget,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return (
    `[migraciones] comando=${command} NODE_ENV=${env.NODE_ENV || '(vacío)'} ` +
    `host=${target.host || '(vacío)'} puerto=${target.port} base=${target.database || '(vacía)'}`
  );
}

export function requiresMigrationConfirmation(
  command: MigrationCommand,
  target: DbTarget,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!COMMANDS_REQUIRING_CONFIRMATION.includes(command)) return false;
  const isProduction = (env.NODE_ENV || '').trim().toLowerCase() === 'production';
  return isProduction || !isLocalDbHost(target.host);
}

/** Devuelve los motivos de bloqueo (vacío = se puede continuar). */
export function getMigrationGuardViolations(
  command: MigrationCommand,
  target: DbTarget,
  env: NodeJS.ProcessEnv = process.env,
): string[] {
  const violations: string[] = [];
  if (!target.host) violations.push('DB_HOST está vacío.');
  if (!target.database) violations.push('DB_DATABASE está vacío.');
  if (
    requiresMigrationConfirmation(command, target, env) &&
    (env.CONFIRM_MIGRATION || '').trim() !== CONFIRM_MIGRATION_VALUE
  ) {
    violations.push(
      `"${command}" contra producción o un host no local requiere CONFIRM_MIGRATION=${CONFIRM_MIGRATION_VALUE}. ` +
        'Revisa host/base arriba y haz un respaldo (mysqldump) antes de continuar.',
    );
  }
  return violations;
}

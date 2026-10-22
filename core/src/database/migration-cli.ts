/**
 * CLI de migraciones con guardia de seguridad.
 *
 *   ts-node src/database/migration-cli.ts <run|revert|show>     (desarrollo)
 *   node dist/database/migration-cli.js <run|revert|show>      (producción, tras `npm run build`)
 *   ts-node src/database/migration-cli.ts check generate        (solo guardia; lo usa migration:generate)
 *
 * Siempre imprime host/base de destino (nunca credenciales). run/revert/generate
 * exigen CONFIRM_MIGRATION=yes con NODE_ENV=production o host no local.
 */
import { MigrationExecutor } from 'typeorm';
import { resolveDbTarget } from '../config/database-options';
import {
  describeMigrationTarget,
  getMigrationGuardViolations,
  isMigrationCommand,
  MigrationCommand,
  MIGRATION_COMMANDS,
} from './migration-guard';

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function guard(command: MigrationCommand): void {
  const target = resolveDbTarget();
  console.log(describeMigrationTarget(command, target));
  const violations = getMigrationGuardViolations(command, target);
  if (violations.length > 0) {
    fail(['[migraciones] Abortado antes de conectar:', ...violations.map((v) => `  - ${v}`)].join('\n'));
  }
}

async function main(): Promise<void> {
  const [first, second] = process.argv.slice(2);
  const checkOnly = first === 'check';
  const command = checkOnly ? second : first;

  if (!command || !isMigrationCommand(command)) {
    fail(`Uso: migration-cli <${MIGRATION_COMMANDS.join('|')}>  |  migration-cli check <comando>`);
  }
  if (command === 'generate' && !checkOnly) {
    fail('Usa `npm run migration:generate -- src/database/migrations/<Nombre>`.');
  }

  // Importar el DataSource carga el archivo .env correspondiente.
  const { AppDataSource } = await import('../config/data-source');
  guard(command);
  if (checkOnly) return;

  await AppDataSource.initialize();
  try {
    const executor = new MigrationExecutor(AppDataSource);
    if (command === 'show') {
      const executed = new Set((await executor.getExecutedMigrations()).map((m) => m.name));
      const all = AppDataSource.migrations.map((m) => m.name || m.constructor.name);
      for (const name of all) console.log(`  [${executed.has(name) ? 'X' : ' '}] ${name}`);
      const pending = all.filter((n) => !executed.has(n)).length;
      console.log(`[migraciones] ${all.length} definidas, ${pending} pendientes.`);
    } else if (command === 'run') {
      const applied = await AppDataSource.runMigrations({ transaction: 'each' });
      console.log(
        applied.length
          ? `[migraciones] Aplicadas: ${applied.map((m) => m.name).join(', ')}`
          : '[migraciones] No había migraciones pendientes.',
      );
    } else if (command === 'revert') {
      const before = new Set((await executor.getExecutedMigrations()).map((m) => m.name));
      await AppDataSource.undoLastMigration({ transaction: 'each' });
      const after = new Set((await executor.getExecutedMigrations()).map((m) => m.name));
      const reverted = [...before].filter((n) => !after.has(n));
      console.log(
        reverted.length
          ? `[migraciones] Revertida: ${reverted.join(', ')}`
          : '[migraciones] No había migraciones que revertir.',
      );
    }
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((error: unknown) => {
  // Solo el mensaje: nunca volcar opciones de conexión.
  fail(`[migraciones] Error: ${error instanceof Error ? error.message : String(error)}`);
});

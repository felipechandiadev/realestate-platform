import { AppDataSource, initializeDataSource } from './seeder.config';
import { assertSafeToSeed } from './seed-guard';

async function cleanInvalidNotificationTypes() {
  assertSafeToSeed(AppDataSource.options as { host?: string; database?: string }, 'clean-notifications');
  await initializeDataSource();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.query(`DELETE FROM notifications WHERE type NOT IN ('INTEREST', 'CONTACT', 'PAYMENT_RECEIPT', 'PAYMENT_OVERDUE', 'PUBLICATION_STATUS_CHANGE', 'CONTRACT_STATUS_CHANGE', 'PROPERTY_AGENT_ASSIGNMENT')`);
    console.log('✓ Notificaciones con tipos inválidos eliminadas');
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

cleanInvalidNotificationTypes()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

import { DataSource, EntityManager } from 'typeorm';

/**
 * Ejecuta `work` dentro de una transacción MySQL usando un QueryRunner.
 *
 * - commit si `work` termina bien;
 * - rollback (si la transacción sigue activa) y se relanza el error si falla;
 * - el QueryRunner se libera siempre.
 *
 * Todas las lecturas/escrituras que deban formar parte de la transacción
 * tienen que usar el `manager` recibido (en REPEATABLE READ una lectura por
 * otra conexión no ve los cambios aún no confirmados).
 */
export async function runInTransaction<T>(
  dataSource: DataSource,
  work: (manager: EntityManager) => Promise<T>,
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const result = await work(queryRunner.manager);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    if (queryRunner.isTransactionActive) {
      await queryRunner.rollbackTransaction();
    }
    throw error;
  } finally {
    await queryRunner.release();
  }
}

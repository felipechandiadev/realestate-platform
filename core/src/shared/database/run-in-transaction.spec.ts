import { DataSource } from 'typeorm';
import { runInTransaction } from './run-in-transaction';

function mockDataSource() {
  const queryRunner = {
    manager: { marker: 'tx-manager' },
    isTransactionActive: false,
    connect: jest.fn(async () => undefined),
    startTransaction: jest.fn(async () => {
      queryRunner.isTransactionActive = true;
    }),
    commitTransaction: jest.fn(async () => {
      queryRunner.isTransactionActive = false;
    }),
    rollbackTransaction: jest.fn(async () => {
      queryRunner.isTransactionActive = false;
    }),
    release: jest.fn(async () => undefined),
  };
  const dataSource = { createQueryRunner: jest.fn(() => queryRunner) } as unknown as DataSource;
  return { dataSource, queryRunner };
}

describe('runInTransaction', () => {
  it('hace commit y libera cuando todo sale bien', async () => {
    const { dataSource, queryRunner } = mockDataSource();
    const result = await runInTransaction(dataSource, async (manager) => {
      expect(manager).toBe(queryRunner.manager);
      return 42;
    });
    expect(result).toBe(42);
    expect(queryRunner.commitTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.rollbackTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('hace rollback, relanza el error y libera cuando falla', async () => {
    const { dataSource, queryRunner } = mockDataSource();
    await expect(
      runInTransaction(dataSource, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });

  it('libera aunque falle el commit', async () => {
    const { dataSource, queryRunner } = mockDataSource();
    queryRunner.commitTransaction.mockRejectedValueOnce(new Error('commit failed'));
    await expect(runInTransaction(dataSource, async () => 'ok')).rejects.toThrow('commit failed');
    expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
    expect(queryRunner.release).toHaveBeenCalledTimes(1);
  });
});

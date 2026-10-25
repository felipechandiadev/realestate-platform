import { CloseContractUseCase } from './close-contract.usecase';
import { ContractRepository } from '../../domain/contract.repository';

describe('CloseContractUseCase', () => {
  const build = () => {
    const update = jest.fn();
    const repo = {
      update,
      withManager: jest.fn(),
    } as unknown as ContractRepository;
    return { update, useCase: new CloseContractUseCase(repo) };
  };

  it('cerrar sin documentos conserva la lista actual', async () => {
    const { update, useCase } = build();
    await useCase.execute('c1', { endDate: '2026-12-01', documents: [] });
    await useCase.execute('c1', { endDate: '2026-12-01' });
    for (const [, patch] of update.mock.calls as Array<
      [string, Record<string, unknown>]
    >) {
      expect(patch).not.toHaveProperty('documents');
      expect(patch.status).toBe('CLOSED');
    }
  });

  it('si vienen documentos, se guardan', async () => {
    const { update, useCase } = build();
    const documents = [
      {
        documentTypeId: 't1',
        title: 'Escritura',
        required: true,
        uploaded: true,
      },
    ];
    await useCase.execute('c1', { endDate: '2026-12-01', documents } as never);
    expect(update).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({ documents }),
    );
  });
});

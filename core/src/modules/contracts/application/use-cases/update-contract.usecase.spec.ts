import { UpdateContractUseCase } from './update-contract.usecase';
import { ContractRepository } from '../../domain/contract.repository';

describe('UpdateContractUseCase', () => {
  const update = jest.fn(async () => undefined);
  const repo = { update } as unknown as ContractRepository;
  const useCase = new UpdateContractUseCase(repo);

  beforeEach(() => {
    update.mockClear();
  });

  it('computes commissionAmount from percentage points when missing', async () => {
    await useCase.execute('c1', {
      amount: 200_000,
      commissionPercent: 3.5,
    } as any);

    expect(update).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        commissionAmount: 7000,
      }),
    );
  });

  it('sums split amounts when commissionAmount missing', async () => {
    await useCase.execute('c1', {
      tenantCommissionAmount: 100,
      landlordCommissionAmount: 50,
    } as any);

    expect(update).toHaveBeenCalledWith(
      'c1',
      expect.objectContaining({
        commissionAmount: 150,
      }),
    );
  });
});

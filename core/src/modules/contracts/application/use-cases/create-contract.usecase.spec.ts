import { CreateContractUseCase } from './create-contract.usecase';
import { ContractRepository } from '../../domain/contract.repository';

describe('CreateContractUseCase', () => {
  const save = jest.fn(async (contract: any) => ({ ...contract, id: 'c1' }));
  const repo = { save } as unknown as ContractRepository;
  const useCase = new CreateContractUseCase(repo);

  beforeEach(() => {
    save.mockClear();
  });

  it('computes commissionAmount from percentage points when missing', async () => {
    await useCase.execute({
      amount: 250_000_000,
      commissionPercent: 5,
    } as any);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        commissionAmount: 12_500_000,
      }),
    );
  });

  it('sums split commission amounts when commissionAmount missing', async () => {
    await useCase.execute({
      amount: 1000,
      tenantCommissionAmount: 10.5,
      landlordCommissionAmount: 20.5,
    } as any);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        commissionAmount: 31,
      }),
    );
  });

  it('keeps explicit commissionAmount', async () => {
    await useCase.execute({
      amount: 1000,
      commissionPercent: 50,
      commissionAmount: 123,
    } as any);

    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        commissionAmount: 123,
      }),
    );
  });
});

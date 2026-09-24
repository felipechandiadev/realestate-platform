import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { Contract } from '../../domain/contract.entity';

@Injectable()
export class CreateContractUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
  ) {}

  async execute(contract: Contract): Promise<Contract> {
    // compute derived fields if not provided
    try {
      if (contract.amount != null && contract.commissionPercent != null && (contract as any).commissionAmount == null) {
        const amt = Number(contract.amount);
        const pct = Number(contract.commissionPercent);
        (contract as any).commissionAmount = Math.round((amt * pct) * 100) / 100;
      }
    } catch (e) {
      // swallow and continue to save
    }
    return await this.contractRepository.save(contract);
  }
}

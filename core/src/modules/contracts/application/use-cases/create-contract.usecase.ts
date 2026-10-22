import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { Contract } from '../../domain/contract.entity';
import { ensureContractCode } from '../../domain/contract-code';

@Injectable()
export class CreateContractUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
  ) {}

  async execute(contract: Contract, manager?: EntityManager): Promise<Contract> {
    try {
      const hasSplit =
        contract.tenantCommissionAmount != null || contract.landlordCommissionAmount != null;
      if (hasSplit && contract.commissionAmount == null) {
        const tenant = Number(contract.tenantCommissionAmount) || 0;
        const landlord = Number(contract.landlordCommissionAmount) || 0;
        contract.commissionAmount = Math.round((tenant + landlord) * 100) / 100;
      } else if (
        contract.amount != null &&
        contract.commissionPercent != null &&
        contract.commissionAmount == null
      ) {
        const amt = Number(contract.amount);
        // commissionPercent is percentage points (e.g. 3.5 = 3.5%)
        const pct = Number(contract.commissionPercent) / 100;
        contract.commissionAmount = Math.round(amt * pct * 100) / 100;
      }
    } catch {
      // swallow and continue to save
    }
    ensureContractCode(contract);
    const repository = manager ? this.contractRepository.withManager(manager) : this.contractRepository;
    return await repository.save(contract);
  }
}

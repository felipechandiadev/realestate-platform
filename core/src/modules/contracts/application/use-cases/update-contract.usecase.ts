import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { UpdateContractDto } from '../../dto/contract.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, dto: UpdateContractDto, manager?: EntityManager): Promise<void> {
    const patch: Record<string, unknown> = { ...(dto as any) };

    const hasSplit =
      patch.tenantCommissionAmount != null || patch.landlordCommissionAmount != null;
    if (hasSplit && patch.commissionAmount == null) {
      const tenant = Number(patch.tenantCommissionAmount) || 0;
      const landlord = Number(patch.landlordCommissionAmount) || 0;
      patch.commissionAmount = Math.round((tenant + landlord) * 100) / 100;
    } else if (
      patch.amount != null &&
      patch.commissionPercent != null &&
      patch.commissionAmount == null
    ) {
      const amt = Number(patch.amount);
      const pct = Number(patch.commissionPercent) / 100;
      patch.commissionAmount = Math.round(amt * pct * 100) / 100;
    }

    const repository = manager ? this.contractRepository.withManager(manager) : this.contractRepository;
    await repository.update(id, patch as any);
  }
}

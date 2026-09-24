import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/contract.entity';

@Injectable()
export class FailContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, endDate: Date): Promise<void> {
    await this.contractRepository.update(id, {
      status: ContractStatus.FAILED,
      endDate,
    } as any);
  }
}

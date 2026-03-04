import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/contract.entity';

@Injectable()
export class ChangeContractStatusUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, status: ContractStatus): Promise<void> {
    await this.contractRepository.update(id, { status } as any);
  }
}

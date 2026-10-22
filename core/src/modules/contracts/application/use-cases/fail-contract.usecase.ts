import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractStatus } from '../../domain/contract.entity';

@Injectable()
export class FailContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, endDate: Date, manager?: EntityManager): Promise<void> {
    const repository = manager ? this.contractRepository.withManager(manager) : this.contractRepository;
    await repository.update(id, {
      status: ContractStatus.FAILED,
      endDate,
    } as any);
  }
}

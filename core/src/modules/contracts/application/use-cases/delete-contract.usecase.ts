import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';

@Injectable()
export class DeleteContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, manager?: EntityManager): Promise<void> {
    const repository = manager ? this.contractRepository.withManager(manager) : this.contractRepository;
    await repository.softDelete(id);
  }
}

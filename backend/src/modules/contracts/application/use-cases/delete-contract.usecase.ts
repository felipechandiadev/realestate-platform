import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';

@Injectable()
export class DeleteContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string): Promise<void> {
    await this.contractRepository.softDelete(id);
  }
}

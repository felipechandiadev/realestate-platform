import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { Contract } from '../../domain/contract.entity';

@Injectable()
export class FindContractUseCase {
  constructor(
    private readonly contractRepository: ContractRepository,
  ) {}

  execute(id: string): Promise<Contract | null> {
    return this.contractRepository.findById(id);
  }
}

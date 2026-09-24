import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { Contract } from '../../domain/contract.entity';

@Injectable()
export class FindAllContractsUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  execute(options?: any): Promise<Contract[]> {
    return this.contractRepository.findAll(options);
  }
}

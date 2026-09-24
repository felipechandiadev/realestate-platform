import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { UpdateContractDto } from '../../dto/contract.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, dto: UpdateContractDto): Promise<void> {
    // basic validation and patch
    await this.contractRepository.update(id, dto as any);
  }
}

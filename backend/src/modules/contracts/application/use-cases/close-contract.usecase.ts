import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { CloseContractDto } from '../../dto/contract.dto';
import { ContractStatus } from '../../domain/contract.entity';

@Injectable()
export class CloseContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, dto: CloseContractDto): Promise<void> {
    // when closing we update status and end date, possibly other fields
    await this.contractRepository.update(id, {
      status: ContractStatus.CLOSED,
      endDate: new Date(dto.endDate),
      documents: dto.documents as any,
    } as any);
  }
}

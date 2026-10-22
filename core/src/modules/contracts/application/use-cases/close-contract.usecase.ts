import { EntityManager } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { CloseContractDto } from '../../dto/contract.dto';
import { ContractStatus } from '../../domain/contract.entity';

@Injectable()
export class CloseContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: string, dto: CloseContractDto, manager?: EntityManager): Promise<void> {
    // when closing we update status and end date, possibly other fields
    const repository = manager ? this.contractRepository.withManager(manager) : this.contractRepository;
    await repository.update(id, {
      status: ContractStatus.CLOSED,
      endDate: new Date(dto.endDate),
      documents: dto.documents as any,
    } as any);
  }
}

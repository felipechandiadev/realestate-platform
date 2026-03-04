import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { AddPersonDto } from '../../dto/contract.dto';
import { ContractPerson } from '../../domain/contract.entity';

@Injectable()
export class AddPersonUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contractId: string, dto: AddPersonDto): Promise<void> {
    const contract: any = await this.contractRepository.findById(contractId);
    if (!contract) {
      throw new NotFoundException('contract not found');
    }
    const people: ContractPerson[] = contract.people ?? [];
    people.push({ personId: dto.personId, role: dto.role } as any);
    await this.contractRepository.update(contractId, { people } as any);
  }
}

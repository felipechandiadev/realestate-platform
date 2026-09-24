import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { ContractRole, ContractPerson } from '../../domain/contract.entity';

@Injectable()
export class GetPeopleByRoleUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contractId: string, role?: ContractRole): Promise<ContractPerson[]> {
    const contract: any = await this.contractRepository.findById(contractId);
    if (!contract || !contract.people) return [];
    if (role) {
      return contract.people.filter(p => p.role === role);
    }
    return contract.people;
  }
}

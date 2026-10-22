import { EntityManager } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/contract.repository';
import { AddPersonDto } from '../../dto/contract.dto';
import { ContractPerson } from '../../domain/contract.entity';

@Injectable()
export class AddPersonUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contractId: string, dto: AddPersonDto, manager?: EntityManager): Promise<void> {
    // En transacción se bloquea la fila (read-modify-write del JSON `people`).
    const contract: any = manager
      ? await this.contractRepository
          .withManager(manager)
          .findOne({ where: { id: contractId }, lock: { mode: 'pessimistic_write' } })
      : await this.contractRepository.findById(contractId);
    if (!contract) {
      throw new NotFoundException('contract not found');
    }
    const people: ContractPerson[] = contract.people ?? [];
    people.push({ personId: dto.personId, role: dto.role } as any);
    const repository = manager ? this.contractRepository.withManager(manager) : this.contractRepository;
    await repository.update(contractId, { people } as any);
  }
}

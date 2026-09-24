import { Injectable } from '@nestjs/common';
import { ContractRole, ContractOperationType } from '../../domain/contract.entity';

@Injectable()
export class ValidateRequiredRolesUseCase {
  execute(contract: any): { valid: boolean; missingRoles: ContractRole[] } {
    if (!contract) {
      return { valid: false, missingRoles: [] };
    }
    const people = contract.people ?? [];
    const present = new Set<ContractRole>(people.map(p => p.role));
    let required: ContractRole[] = [];
    // decide based on operation
    switch (contract.operation) {
      case ContractOperationType.COMPRAVENTA:
        required = [ContractRole.SELLER, ContractRole.BUYER];
        break;
      case ContractOperationType.ARRIENDO:
        required = [ContractRole.LANDLORD, ContractRole.TENANT];
        break;
      default:
        required = [];
    }
    const missing = required.filter(r => !present.has(r));
    return { valid: missing.length === 0, missingRoles: missing };
  }
}

import { ContractStatus } from '../../../modules/contracts/domain/contract.entity';

const finalStatuses = new Set<ContractStatus>([
  ContractStatus.CLOSED,
  ContractStatus.FAILED,
]);

export function isFinalContractStatus(status?: ContractStatus | string | null): boolean {
  if (!status) {
    return false;
  }
  const normalized = typeof status === 'string' ? status.toUpperCase() : status;
  return finalStatuses.has(normalized as ContractStatus);
}

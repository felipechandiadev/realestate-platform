import { BadRequestException } from '@nestjs/common';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import {
  ContractCurrency,
  ContractOperationType,
  ContractStatus,
} from './contract.entity';
import { PaymentType } from './payment.entity';

/**
 * Reglas de negocio de contratos que no dependen de la persistencia.
 */

/** Solo un contrato en proceso puede cerrarse o marcarse como fallido. */
export function assertContractTransition(
  from: ContractStatus | string,
  to: ContractStatus,
): void {
  const current = String(from);
  if (current === String(to)) {
    throw new BadRequestException(`El contrato ya está ${statusLabel(to)}.`);
  }
  if (current !== String(ContractStatus.IN_PROCESS)) {
    throw new BadRequestException(
      `Solo un contrato en proceso puede pasar a ${statusLabel(to)} (estado actual: ${statusLabel(from)}).`,
    );
  }
}

/** Estado que debe tener la propiedad según el contrato. */
export function propertyStatusForContract(
  operation: ContractOperationType | string,
  status: ContractStatus | string,
): PropertyStatus {
  switch (String(status)) {
    case String(ContractStatus.IN_PROCESS):
      return PropertyStatus.CONTRACT_IN_PROGRESS;
    case String(ContractStatus.CLOSED):
      return String(operation) === String(ContractOperationType.ARRIENDO)
        ? PropertyStatus.RENTED
        : PropertyStatus.SOLD;
    default:
      // Contrato fallido o eliminado: la propiedad vuelve a estar disponible.
      return PropertyStatus.PUBLISHED;
  }
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    [ContractStatus.IN_PROCESS]: 'en proceso',
    [ContractStatus.CLOSED]: 'cerrado',
    [ContractStatus.FAILED]: 'fallido',
  };
  return labels[status] ?? status;
}

/**
 * Moneda de un pago cuando no viene indicada: las comisiones se calculan en
 * pesos; el resto (arriendo, pie, cuotas, depósito) va en la moneda del contrato.
 */
export function defaultPaymentCurrency(
  type: PaymentType | string,
  contractCurrency?: ContractCurrency | string | null,
): ContractCurrency {
  if (String(type) === String(PaymentType.COMMISSION_INCOME)) return ContractCurrency.CLP;
  return String(contractCurrency) === String(ContractCurrency.UF)
    ? ContractCurrency.UF
    : ContractCurrency.CLP;
}

import { BadRequestException } from '@nestjs/common';
import {
  ContractCurrency,
  ContractOperationType,
  ContractStatus,
} from './contract.entity';
import { PaymentType } from './payment.entity';
import { PropertyStatus } from '../../../shared/enums/property-status.enum';
import {
  assertContractTransition,
  defaultPaymentCurrency,
  propertyStatusForContract,
} from './contract-rules';

describe('contract-rules', () => {
  describe('assertContractTransition', () => {
    it('permite cerrar o fallar un contrato en proceso', () => {
      expect(() =>
        assertContractTransition(
          ContractStatus.IN_PROCESS,
          ContractStatus.CLOSED,
        ),
      ).not.toThrow();
      expect(() =>
        assertContractTransition(
          ContractStatus.IN_PROCESS,
          ContractStatus.FAILED,
        ),
      ).not.toThrow();
    });

    it('rechaza transiciones desde un contrato terminado o al mismo estado', () => {
      expect(() =>
        assertContractTransition(ContractStatus.FAILED, ContractStatus.CLOSED),
      ).toThrow(BadRequestException);
      expect(() =>
        assertContractTransition(ContractStatus.CLOSED, ContractStatus.FAILED),
      ).toThrow(
        'Solo un contrato en proceso puede pasar a fallido (estado actual: cerrado).',
      );
      expect(() =>
        assertContractTransition(ContractStatus.CLOSED, ContractStatus.CLOSED),
      ).toThrow('El contrato ya está cerrado.');
    });
  });

  describe('propertyStatusForContract', () => {
    it.each([
      [
        ContractOperationType.COMPRAVENTA,
        ContractStatus.IN_PROCESS,
        PropertyStatus.CONTRACT_IN_PROGRESS,
      ],
      [
        ContractOperationType.ARRIENDO,
        ContractStatus.IN_PROCESS,
        PropertyStatus.CONTRACT_IN_PROGRESS,
      ],
      [
        ContractOperationType.COMPRAVENTA,
        ContractStatus.CLOSED,
        PropertyStatus.SOLD,
      ],
      [
        ContractOperationType.ARRIENDO,
        ContractStatus.CLOSED,
        PropertyStatus.RENTED,
      ],
      [
        ContractOperationType.COMPRAVENTA,
        ContractStatus.FAILED,
        PropertyStatus.PUBLISHED,
      ],
      [
        ContractOperationType.ARRIENDO,
        ContractStatus.FAILED,
        PropertyStatus.PUBLISHED,
      ],
    ])('%s %s → %s', (operation, status, expected) => {
      expect(propertyStatusForContract(operation, status)).toBe(expected);
    });
  });

  describe('defaultPaymentCurrency', () => {
    it('las comisiones van en CLP; el resto en la moneda del contrato', () => {
      expect(
        defaultPaymentCurrency(
          PaymentType.COMMISSION_INCOME,
          ContractCurrency.UF,
        ),
      ).toBe('CLP');
      expect(
        defaultPaymentCurrency(PaymentType.RENT_PAYMENT, ContractCurrency.UF),
      ).toBe('UF');
      expect(
        defaultPaymentCurrency(PaymentType.DEPOSIT, ContractCurrency.CLP),
      ).toBe('CLP');
      expect(
        defaultPaymentCurrency(PaymentType.SALE_INSTALLMENT, undefined),
      ).toBe('CLP');
    });
  });
});

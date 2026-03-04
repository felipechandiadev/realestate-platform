// Tipos locales para contratos - evita dependencias del backend en frontend

export enum ContractOperationType {
  COMPRAVENTA = 'COMPRAVENTA',
  ARRIENDO = 'ARRIENDO',
}

export enum ContractStatus {
  IN_PROCESS = 'IN_PROCESS',
  CLOSED = 'CLOSED',
  FAILED = 'FAILED',
}

export const FINAL_CONTRACT_STATUSES: readonly ContractStatus[] = [
  ContractStatus.CLOSED,
  ContractStatus.FAILED,
];

export enum ContractRole {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  LANDLORD = 'LANDLORD',
  TENANT = 'TENANT',
  NOTARY = 'NOTARY',
  REGISTRAR = 'REGISTRAR',
  WITNESS = 'WITNESS',
  GUARANTOR = 'GUARANTOR',
  REPRESENTATIVE = 'REPRESENTATIVE',
  PROMISSOR = 'PROMISSOR',
  THIRD_PARTY = 'THIRD_PARTY',
  AGENT = 'AGENT',
}

export enum PaymentType {
  COMMISSION_INCOME = 'COMMISSION_INCOME',
  RENT_PAYMENT = 'RENT_PAYMENT',
  SALE_DOWN_PAYMENT = 'SALE_DOWN_PAYMENT',
  SALE_INSTALLMENT = 'SALE_INSTALLMENT',
  SALE_FINAL_PAYMENT = 'SALE_FINAL_PAYMENT',
  DEPOSIT = 'DEPOSIT',
  MAINTENANCE_FEE = 'MAINTENANCE_FEE',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER',
}

export enum ContractCurrency {
  CLP = 'CLP',
  UF = 'UF',
}

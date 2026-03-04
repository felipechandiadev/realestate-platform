// Domain model for Contract (no decorators, pure business entity)
// helper interfaces previously lived in the central entity; copy them here
import { DocumentStatus } from '../../document/domain/document.entity';
import { PaymentStatus } from './payment.entity';

export interface ContractPerson {
  personId: string;
  role: ContractRole;
  personName?: string;
  personDni?: string;
  person?: {
    id: string;
    name?: string;
    dni?: string;
  };
}

export interface ContractPaymentDocument {
  id?: string;
  title?: string;
  status?: DocumentStatus;
  documentType?: {
    id: string;
    name?: string;
  };
  multimediaId?: string;
  multimedia?: {
    id: string;
    url: string;
    filename?: string;
  };
  uploadedById?: string;
  createdAt?: string | Date;
  personId?: string;
  person?: {
    id: string;
    name?: string;
    dni?: string;
  };
  personName?: string;
  personDni?: string;
}

export enum PaymentType {
  COMMISSION_INCOME = 'COMMISSION_INCOME',     // Ingreso por comisión (venta)
  RENT_PAYMENT = 'RENT_PAYMENT',               // Pago de arriendo mensual
  SALE_DOWN_PAYMENT = 'SALE_DOWN_PAYMENT',     // Pie/cuota inicial (venta)
  SALE_INSTALLMENT = 'SALE_INSTALLMENT',       // Cuota mensual (venta)
  SALE_FINAL_PAYMENT = 'SALE_FINAL_PAYMENT',   // Pago final/escritura (venta)
  DEPOSIT = 'DEPOSIT',                         // Depósito/garantía
  MAINTENANCE_FEE = 'MAINTENANCE_FEE',         // Gastos comunes
  UTILITIES = 'UTILITIES',                     // Servicios básicos
  OTHER = 'OTHER',                             // Otro tipo de pago
}

export interface ContractPayment {
  id?: string;
  amount: number;
  date: string | Date;
  description?: string;
  type: PaymentType;  // Tipo de pago para categorización
  status?: PaymentStatus;
  paidAt?: string | Date | null;
  isAgencyRevenue?: boolean;
  documents?: ContractPaymentDocument[];
}

export interface ContractDocument {
  documentTypeId: string;
  documentId?: string;
  id?: string;
  personId?: string;        // Persona asociada al documento (opcional)
  person?: {
    id: string;
    name?: string;
    dni?: string;
  };
  personName?: string;
  personDni?: string;
  title: string;            // Descripción/título del documento
  required: boolean;
  uploaded: boolean;
  status?: DocumentStatus;
  notes?: string;
  uploadedById?: string;
  uploadedByName?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  documentType?: {
    id: string;
    name?: string;
  };
  documentTypeName?: string;
  multimediaId?: string;
  multimedia?: {
    id: string;
    url: string;
    filename?: string;
  };
  contractCode?: string;
}

export interface ContractHistoryChange {
  field: string;
  previousValue: unknown;
  newValue: unknown;
}

export interface ContractHistoryEntry {
  id: string;
  timestamp: string;
  userId: string | null;
  action: string;
  changes: ContractHistoryChange[];
  metadata?: Record<string, unknown>;
}
export class Contract {
  id: string;
  code: string;
  userId?: string;
  propertyId?: string;
  operation: ContractOperationType;
  status: ContractStatus;
  endDate?: Date | null;
  amount: number;
  currency: ContractCurrency;
  // optional business attributes referenced by service logic
  ufValue?: number;
  commissionPercent?: number;
  commissionAmount?: number;
  description?: string;
  people?: ContractPerson[];
  payments?: ContractPayment[];
  documents?: ContractDocument[];
  changeHistory?: ContractHistoryEntry[];
  user?: { id: string };
  property?: { id: string };
  // ... additional fields as needed
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
export enum ContractOperationType {
  COMPRAVENTA = 'COMPRAVENTA',
  ARRIENDO = 'ARRIENDO',
}

export enum ContractStatus {
  IN_PROCESS = 'IN_PROCESS',
  CLOSED = 'CLOSED',
  FAILED = 'FAILED',
}

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

export enum ContractCurrency {
  CLP = 'CLP',
  UF = 'UF',
}

export type ContractOperationType = 'COMPRAVENTA' | 'ARRIENDO';

export type ContractStatus = 'IN_PROCESS' | 'CLOSED' | 'FAILED';

export type ContractRole = 'SELLER' | 'BUYER' | 'LANDLORD' | 'TENANT' | 'NOTARY' | 'REGISTRAR' | 'WITNESS' | 'GUARANTOR' | 'REPRESENTATIVE' | 'PROMISSOR' | 'THIRD_PARTY' | 'AGENT';

export type ContractCurrency = 'CLP' | 'UF';

export type PaymentType = 'COMMISSION_INCOME' | 'RENT_PAYMENT' | 'SALE_DOWN_PAYMENT' | 'SALE_INSTALLMENT' | 'SALE_FINAL_PAYMENT' | 'DEPOSIT' | 'MAINTENANCE_FEE' | 'UTILITIES' | 'OTHER';

export interface ContractPerson {
  personId: string;
  role: ContractRole;
}

export interface ContractPayment {
  amount: number;
  date: Date;
  description?: string;
  type: PaymentType;
  isAgencyRevenue?: boolean;
}

export interface ContractDocument {
  documentTypeId: string;
  documentId?: string;
  required: boolean;
  uploaded: boolean;
}

export interface Contract {
  id: string;
  userId: string;
  propertyId: string;
  operation: ContractOperationType;
  status: ContractStatus;
  endDate?: Date;
  amount: number;
  currency: ContractCurrency;
  ufValue?: number;
  commissionPercent: number;
  commissionAmount: number;
  payments?: ContractPayment[];
  documents?: ContractDocument[];
  people: ContractPerson[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations
  property?: {
    id: string;
    title?: string;
    address?: string;
    city?: string;
    state?: string;
  };
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}
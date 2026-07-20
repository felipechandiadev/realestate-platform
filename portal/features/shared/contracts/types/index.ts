/**
 * @fileoverview Contract domain types and data transfer objects
 * Handles contract operations (COMPRAVENTA, ARRIENDO), payments, persons, documents
 */

/**
 * Contract operation types
 */
export type ContractOperationType = 'COMPRAVENTA' | 'ARRIENDO';

/**
 * Contract status tracking
 */
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';

/**
 * Person roles within a contract
 */
export type ContractRole = 'BUYER' | 'SELLER' | 'TENANT' | 'LANDLORD' | 'WITNESS' | 'AGENCY';

/**
 * Currency types for contract values
 */
export type ContractCurrency = 'CLP' | 'USD' | 'UF';

/**
 * Payment types
 */
export type PaymentType = 'CASH' | 'BANK_TRANSFER' | 'CHECK' | 'INSTALLMENT';

/**
 * Payment status
 */
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

/**
 * Main Contract entity
 */
export interface Contract {
  id: string;
  userId: string;
  propertyId: string;
  operation: ContractOperationType;
  contractType?: string;
  status: ContractStatus;
  value: number;
  price?: number;
  commissionPercentage?: number;
  commissionAmount?: number;
  currency: ContractCurrency;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  partyName?: string;
  persons: ContractPerson[];
  payments: Payment[];
  documents: ContractDocument[];
  agent?: ContractAgent;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Person involved in contract
 */
export interface ContractPerson {
  id: string;
  personId: string;
  role: ContractRole;
  name: string;
  email?: string;
  phone?: string;
  addedAt: Date;
}

/**
 * Payment tracking within contract
 */
export interface Payment {
  id: string;
  amount: number;
  date: Date;
  type: PaymentType;
  status: PaymentStatus;
  description?: string;
  paidAt?: Date;
  isAgencyRevenue?: boolean;
  document?: ContractDocument;
}

/**
 * Document associated with contract
 */
export interface ContractDocument {
  id: string;
  documentTypeId: string;
  name: string;
  url: string;
  required: boolean;
  uploaded: boolean;
  uploadedAt?: Date;
  expiresAt?: Date;
}

/**
 * Agent assigned to contract
 */
export interface ContractAgent {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Grid view contract with minimal fields
 */
export interface ContractGridItem {
  id: string;
  propertyTitle: string;
  operation: ContractOperationType;
  status: ContractStatus;
  value: number;
  currency: ContractCurrency;
  startDate: Date;
  endDate?: Date;
  personCount: number;
  paymentsPending: number;
  createdAt: Date;
  // Compatibility fields for grid rendering
  property?: { address?: string };
  propertyId?: string;
  partyName?: string;
  contractType?: string;
}

/**
 * Response for paginated contracts
 */
export interface ContractGridResponse {
  items: ContractGridItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  data?: ContractGridItem[];
  meta?: {
    totalCount?: number;
    totalPages?: number;
  };
}

/**
 * Create contract DTO
 */
export interface CreateContractDto {
  propertyId: string;
  operation: ContractOperationType;
  contractType?: string;
  partyName?: string;
  value: number;
  currency: ContractCurrency;
  startDate: Date | string;
  endDate?: Date | string;
  notes?: string;
  persons: CreateContractPersonDto[];
}

export type CreateContractInput = CreateContractDto;

/**
 * Update contract DTO
 */
export interface UpdateContractDto {
  status?: ContractStatus;
  contractType?: string;
  partyName?: string;
  startDate?: Date | string;
  value?: number;
  endDate?: Date | string;
  notes?: string;
}

export type UpdateContractInput = UpdateContractDto;

/**
 * Person to add to contract
 */
export interface CreateContractPersonDto {
  personId: string;
  role: ContractRole;
}

/**
 * Add payment DTO
 */
export interface AddPaymentDto {
  amount: number;
  date: Date;
  type: PaymentType;
  description?: string;
  isAgencyRevenue?: boolean;
}

/**
 * Payment status update DTO
 */
export interface UpdatePaymentStatusDto {
  status: PaymentStatus;
  paidAt?: Date;
}

/**
 * Query parameters for filtering contracts
 */
export interface ContractQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'asc' | 'desc';
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  pagination?: boolean;
  filtration?: boolean;
  operation?: ContractOperationType;
  status?: ContractStatus;
  sortField?: 'createdAt' | 'value' | 'startDate';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  propertyId?: string;
}
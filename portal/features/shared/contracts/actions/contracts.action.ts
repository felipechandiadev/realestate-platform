'use server';

import { env } from '@/lib/env';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ContractOperationType, ContractStatus } from '@/shared/types/contracts';

/** Fila de `GET /contracts/user/:id` con los `fields` que pide `getUserContracts`. */
export interface UserContract {
  id: string;
  code?: string | null;
  operation: ContractOperationType;
  status: ContractStatus;
  amount: number;
  currency: 'CLP' | 'UF';
  ufValue?: number | null;
  createdAt: string;
  endDate?: string | null;
  property?: { id?: string; title?: string | null; address?: string | null } | null;
}

/** Pago de arriendo tal como lo devuelve `GET /contracts/:id/payments/RENT_PAYMENT`. */
export interface RentPayment {
  id: string;
  amount: number;
  date: string;
  status: string;
  description?: string | null;
  paidAt?: string | null;
}

/** Subconjunto de `GET /contracts/:id` usado por el portal. */
export interface ContractDetails {
  id: string;
  code?: string | null;
  property?: { id?: string; title?: string | null } | null;
}

export interface ContractDocumentSummary {
  id: string;
  name: string;
  status?: string;
  required?: boolean;
  uploaded?: boolean;
}

export interface ContractGridRow {
  id: string;
  code?: string;
  operation: ContractOperationType;
  status: ContractStatus;
  amount: number;
  currency: 'CLP' | 'UF';
  ufValue?: number;
  commissionPercent: number;
  commissionAmount: number;
  propertyTitle?: string;
  propertyAddress?: string;
  clientName?: string;
  agentName?: string;
  createdAt: Date;
  endDate?: Date;
  documents?: ContractDocumentSummary[];
}

export interface ListContractsParams {
  sort?: 'asc' | 'desc';
  sortField?: string;
  search?: string;
  filters?: string;
  filtration?: boolean;
  page?: number;
  limit?: number;
  pagination?: boolean;
  operation?: ContractOperationType;
}

export interface ListContractsResult {
  data: ContractGridRow[];
  total: number;
}

/**
 * Obtiene los contratos de un usuario específico
 */
export async function getUserContracts(userId: string, params: ListContractsParams = {}): Promise<UserContract[]> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('No autorizado');
  }

  // Community tokens can only read their own contracts; ignore mismatched client ids.
  const effectiveUserId = session.user?.id || userId;

  const queryParams = new URLSearchParams({
    fields: 'id,code,operation,status,amount,currency,ufValue,createdAt,endDate,property',
    sort: params.sort || '',
    sortField: params.sortField || '',
    page: (params.page || 1).toString(),
    limit: (params.limit || 25).toString(),
    pagination: 'true',
  });

  const response = await fetch(`${env.backendApiUrl}/contracts/user/${effectiveUserId}?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Accept': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener contratos del usuario: ${response.status}`);
  }

  const result = (await response.json()) as UserContract[] | { data: UserContract[] };
  return Array.isArray(result) ? result : result.data;
}

/**
 * Obtiene los pagos de arriendo de un contrato específico
 */
export async function getContractRentPayments(contractId: string): Promise<RentPayment[]> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No autorizado');
  }

  const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}/payments/RENT_PAYMENT`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    next: { revalidate: 0 } // No cache for payments
  });

  if (!response.ok) {
    throw new Error('Error al cargar los pagos del contrato');
  }

  return response.json();
}

/**
 * Obtiene los detalles básicos de un contrato
 */
export async function getContractDetails(contractId: string): Promise<ContractDetails> {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;
  
    if (!accessToken) {
      throw new Error('No autorizado');
    }
  
    const response = await fetch(`${env.backendApiUrl}/contracts/${contractId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  
    if (!response.ok) {
      throw new Error('Error al cargar los detalles del contrato');
    }
  
    return response.json();
}

/**
 * Sube un comprobante de pago para un pago de arriendo
 */
export async function uploadPaymentProof(
  contractId: string,
  paymentId: string,
  formData: FormData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(
      `${env.backendApiUrl}/contracts/${contractId}/payments/${paymentId}/proof`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || 'Error al subir el comprobante' 
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error in uploadPaymentProof:', error);
    return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * @fileoverview HTTP service layer for contract operations
 * Pure functions that communicate with backend API
 * No React hooks, no side effects
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import type {
  Contract,
  ContractGridResponse,
  CreateContractDto,
  UpdateContractDto,
  AddPaymentDto,
  UpdatePaymentStatusDto,
  ContractQueryParams,
} from '../types';

/**
 * Get authenticated access token
 */
async function getAccessToken(): Promise<string> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa. Por favor, inicia sesión.');
  }

  return accessToken;
}

/**
 * Make authenticated fetch request to backend
 */
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const accessToken = await getAccessToken();
  const url = new URL(endpoint, env.backendApiUrl).toString();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      error || `Error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Fetch all contracts with pagination and filters
 */
export async function getContractsService(
  params?: ContractQueryParams
): Promise<ContractGridResponse> {
  const searchParams = new URLSearchParams();

  if (params?.page) searchParams.append('page', String(params.page));
  if (params?.limit) searchParams.append('limit', String(params.limit));
  if (params?.search) searchParams.append('search', params.search);
  if (params?.operation) searchParams.append('operation', params.operation);
  if (params?.status) searchParams.append('status', params.status);
  if (params?.sortField) searchParams.append('sortField', params.sortField);
  if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

  const queryString = searchParams.toString();
  const endpoint = `/contracts${queryString ? `?${queryString}` : ''}`;

  return apiFetch<ContractGridResponse>(endpoint);
}

/**
 * Fetch single contract by ID
 */
export async function getContractByIdService(id: string): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${id}`);
}

/**
 * Create new contract
 */
export async function createContractService(
  data: CreateContractDto
): Promise<Contract> {
  return apiFetch<Contract>('/contracts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update contract
 */
export async function updateContractService(
  id: string,
  data: UpdateContractDto
): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Add payment to contract
 */
export async function addPaymentToContractService(
  contractId: string,
  data: AddPaymentDto
): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${contractId}/payments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update payment status
 */
export async function updatePaymentStatusService(
  contractId: string,
  paymentId: string,
  data: UpdatePaymentStatusDto
): Promise<Contract> {
  return apiFetch<Contract>(
    `/contracts/${contractId}/payments/${paymentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    }
  );
}

/**
 * Add person to contract
 */
export async function addPersonToContractService(
  contractId: string,
  personId: string,
  role: string
): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${contractId}/persons`, {
    method: 'POST',
    body: JSON.stringify({ personId, role }),
  });
}

/**
 * Remove person from contract
 */
export async function removePersonFromContractService(
  contractId: string,
  personId: string
): Promise<Contract> {
  return apiFetch<Contract>(
    `/contracts/${contractId}/persons/${personId}`,
    { method: 'DELETE' }
  );
}

/**
 * Close contract
 */
export async function closeContractService(id: string): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${id}/close`, {
    method: 'POST',
  });
}

/**
 * Cancel contract
 */
export async function cancelContractService(id: string): Promise<Contract> {
  return apiFetch<Contract>(`/contracts/${id}/cancel`, {
    method: 'POST',
  });
}

/**
 * Upload contract document
 */
export async function uploadContractDocumentService(
  contractId: string,
  documentTypeId: string,
  file: File
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('documentTypeId', documentTypeId);

  const accessToken = await getAccessToken();
  const url = new URL(
    `/contracts/${contractId}/documents`,
    env.backendApiUrl
  ).toString();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error uploading document: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export contract as PDF
 */
export async function exportContractAsPdfService(id: string): Promise<Blob> {
  const accessToken = await getAccessToken();
  const url = new URL(`/contracts/${id}/export`, env.backendApiUrl).toString();

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error exporting contract');
  }

  return response.blob();
}
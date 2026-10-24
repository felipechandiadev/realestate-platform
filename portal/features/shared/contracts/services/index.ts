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
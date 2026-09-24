/**
 * @fileoverview React Query hooks for contract operations
 * Handles data fetching, mutations, caching, and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ContractQueryParams } from '../types';
import * as contractsService from '../services';

/**
 * Query key factory for contracts
 */
export const contractKeys = {
  all: () => ['contracts'] as const,
  lists: () => [...contractKeys.all(), 'list'] as const,
  list: (params?: ContractQueryParams) =>
    [...contractKeys.lists(), params] as const,
  detail: (id: string) => [...contractKeys.all(), 'detail', id] as const,
  payments: (contractId: string) =>
    [...contractKeys.all(), contractId, 'payments'] as const,
  documents: (contractId: string) =>
    [...contractKeys.all(), contractId, 'documents'] as const,
};

/**
 * Fetch contracts with pagination and filters
 */
export function useContracts(params?: ContractQueryParams) {
  return useQuery({
    queryKey: contractKeys.list(params),
    queryFn: () => contractsService.getContractsService(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch single contract by ID
 */
export function useContractById(id?: string) {
  return useQuery({
    queryKey: contractKeys.detail(id || ''),
    queryFn: () => contractsService.getContractByIdService(id as string),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * Create contract mutation
 */
export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => contractsService.createContractService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

/**
 * Update contract mutation
 */
export function useUpdateContract(id?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => {
      const resolvedId = id ?? payload?.id;
      const data = id ? payload : payload?.data;
      return contractsService.updateContractService(resolvedId, data);
    },
    onSuccess: () => {
      if (id) {
        queryClient.invalidateQueries({ queryKey: contractKeys.detail(id) });
      }
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

/**
 * Add payment mutation
 */
export function useAddPayment(contractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) =>
      contractsService.addPaymentToContractService(contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(contractId),
      });
      queryClient.invalidateQueries({ queryKey: contractKeys.payments(contractId) });
    },
  });
}

/**
 * Update payment status mutation
 */
export function useUpdatePaymentStatus(contractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, status }: any) =>
      contractsService.updatePaymentStatusService(contractId, paymentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(contractId),
      });
      queryClient.invalidateQueries({ queryKey: contractKeys.payments(contractId) });
    },
  });
}

/**
 * Add person to contract mutation
 */
export function useAddPersonToContract(contractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ personId, role }: any) =>
      contractsService.addPersonToContractService(contractId, personId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(contractId),
      });
    },
  });
}

/**
 * Remove person from contract mutation
 */
export function useRemovePersonFromContract(contractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (personId: string) =>
      contractsService.removePersonFromContractService(contractId, personId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: contractKeys.detail(contractId),
      });
    },
  });
}

/**
 * Close contract mutation
 */
export function useCloseContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractsService.closeContractService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

/**
 * Cancel contract mutation
 */
export function useCancelContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contractsService.cancelContractService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
    },
  });
}

/**
 * Upload contract document mutation
 */
export function useUploadContractDocument(contractId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentTypeId, file, contractId: payloadContractId }: any) =>
      contractsService.uploadContractDocumentService(
        contractId || payloadContractId || '',
        documentTypeId,
        file
      ),
    onSuccess: () => {
      if (contractId) {
        queryClient.invalidateQueries({
          queryKey: contractKeys.detail(contractId),
        });
        queryClient.invalidateQueries({
          queryKey: contractKeys.documents(contractId),
        });
      }
    },
  });
}

/**
 * Export contract as PDF
 */
export function useExportContractAsPdf() {
  return useMutation({
    mutationFn: (id: string) => contractsService.exportContractAsPdfService(id),
  });
}

export const useContractsGrid = useContracts;

export function useDeleteContract() {
  return useMutation({
    mutationFn: (id: string) => contractsService.cancelContractService(id),
  });
}

export function useUpdateContractFinancials(contractId: string) {
  return useUpdateContract(contractId);
}
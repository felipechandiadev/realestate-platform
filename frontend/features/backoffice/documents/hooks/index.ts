import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsService } from "../services";
import type { CreateDocumentInput, UpdateDocumentInput, DocumentFilterInput } from "../types";

const DOCUMENTS_QUERY_KEY = ["documents"];

export function useDocuments(params?: { limit?: number; offset?: number; filters?: DocumentFilterInput }) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, params],
    queryFn: () => documentsService.getDocuments(params),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, id],
    queryFn: () => documentsService.getDocument(id),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentInput) => documentsService.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentInput }) =>
      documentsService.updateDocument(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...DOCUMENTS_QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => documentsService.uploadFile(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useDocumentsByProperty(propertyId: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, "property", propertyId],
    queryFn: () => documentsService.getDocumentsByProperty(propertyId),
    enabled: !!propertyId,
  });
}

export function useDocumentsByContract(contractId: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, "contract", contractId],
    queryFn: () => documentsService.getDocumentsByContract(contractId),
    enabled: !!contractId,
  });
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: (id: string) => documentsService.downloadDocument(id),
  });
}

export function useSearchDocuments(query: string) {
  return useQuery({
    queryKey: [...DOCUMENTS_QUERY_KEY, "search", query],
    queryFn: () => documentsService.searchDocuments(query),
    enabled: !!query && query.length > 2,
  });
}
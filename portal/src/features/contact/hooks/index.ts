import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactService } from "../services";
import type { CreateContactInput } from "../types";

const CONTACT_QUERY_KEY = ["contact"];

export function useSubmitContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactInput) => contactService.submitContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONTACT_QUERY_KEY, "messages"] });
    },
  });
}

export function useContacts(params?: { page?: number; pageSize?: number; status?: string }) {
  return useQuery({
    queryKey: [...CONTACT_QUERY_KEY, "messages", params],
    queryFn: () => contactService.getContacts(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: [...CONTACT_QUERY_KEY, "messages", id],
    queryFn: () => contactService.getContact(id),
    enabled: !!id,
  });
}

export function useUpdateContactStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, priority }: { id: string; status: string; priority?: string }) =>
      contactService.updateContactStatus(id, status, priority),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...CONTACT_QUERY_KEY, "messages", id] });
      queryClient.invalidateQueries({ queryKey: [...CONTACT_QUERY_KEY, "messages"] });
    },
  });
}

export function useContactResponses(messageId: string) {
  return useQuery({
    queryKey: [...CONTACT_QUERY_KEY, "messages", messageId, "responses"],
    queryFn: () => contactService.getResponses(messageId),
    enabled: !!messageId,
  });
}

export function useSendResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, response }: { messageId: string; response: string }) =>
      contactService.sendResponse(messageId, response),
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({ queryKey: [...CONTACT_QUERY_KEY, "messages", messageId, "responses"] });
      queryClient.invalidateQueries({ queryKey: [...CONTACT_QUERY_KEY, "messages", messageId] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => contactService.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...CONTACT_QUERY_KEY, "messages"] });
    },
  });
}

export function useExportContacts() {
  return useMutation({
    mutationFn: (format: "csv" | "pdf" = "csv") => contactService.exportContacts(format),
  });
}

export function useSubscribeToNewsletter() {
  return useMutation({
    mutationFn: (email: string) => contactService.subscribeToNewsletter(email),
  });
}
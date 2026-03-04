import { apiClient } from "@/lib/api/client";
import type { ContactMessage, ContactResponse, ContactsListResponse, CreateContactInput } from "../types";

const BASE_URL = "/contact";

export const contactService = {
  async submitContact(data: CreateContactInput) {
    const response = await apiClient.post<ContactMessage>(BASE_URL, data);
    return response.data;
  },

  async getContacts(params?: { page?: number; pageSize?: number; status?: string }) {
    const response = await apiClient.get<ContactsListResponse>(`${BASE_URL}/messages`, { params });
    return response.data;
  },

  async getContact(id: string) {
    const response = await apiClient.get<ContactMessage>(`${BASE_URL}/messages/${id}`);
    return response.data;
  },

  async updateContactStatus(id: string, status: string, priority?: string) {
    const response = await apiClient.patch<ContactMessage>(`${BASE_URL}/messages/${id}`, {
      status,
      priority,
    });
    return response.data;
  },

  async getResponses(messageId: string) {
    const response = await apiClient.get<ContactResponse[]>(`${BASE_URL}/messages/${messageId}/responses`);
    return response.data;
  },

  async sendResponse(messageId: string, response: string) {
    const apiResponse = await apiClient.post<ContactResponse>(`${BASE_URL}/messages/${messageId}/respond`, {
      response,
    });
    return apiResponse.data;
  },

  async deleteContact(id: string) {
    await apiClient.delete(`${BASE_URL}/messages/${id}`);
  },

  async exportContacts(format: "csv" | "pdf" = "csv") {
    const response = await apiClient.get<Blob>(`${BASE_URL}/export`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  },

  async subscribeToNewsletter(email: string) {
    const response = await apiClient.post<{ success: boolean }>(`${BASE_URL}/newsletter/subscribe`, {
      email,
    });
    return response.data;
  },
};
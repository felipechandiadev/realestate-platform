import { apiClient } from "@/lib/api/client";
import type { Document, DocumentFilterInput, UploadedFile, CreateDocumentInput, UpdateDocumentInput } from "../types";

const BASE_URL = "/documents";

export const documentsService = {
  async getDocuments(params?: { limit?: number; offset?: number; filters?: DocumentFilterInput }) {
    const response = await apiClient.get<{ items: Document[]; total: number }>(BASE_URL, { params });
    return response.data;
  },

  async getDocument(id: string) {
    const response = await apiClient.get<Document>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async createDocument(data: CreateDocumentInput) {
    const response = await apiClient.post<Document>(BASE_URL, data);
    return response.data;
  },

  async updateDocument(id: string, data: UpdateDocumentInput) {
    const response = await apiClient.patch<Document>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async deleteDocument(id: string) {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<UploadedFile>(`${BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  async getDocumentsByProperty(propertyId: string) {
    const response = await apiClient.get<Document[]>(`${BASE_URL}/property/${propertyId}`);
    return response.data;
  },

  async getDocumentsByContract(contractId: string) {
    const response = await apiClient.get<Document[]>(`${BASE_URL}/contract/${contractId}`);
    return response.data;
  },

  async downloadDocument(id: string) {
    const response = await apiClient.get<Blob>(`${BASE_URL}/${id}/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  async searchDocuments(query: string) {
    const response = await apiClient.get<Document[]>(`${BASE_URL}/search`, { params: { q: query } });
    return response.data;
  },
};
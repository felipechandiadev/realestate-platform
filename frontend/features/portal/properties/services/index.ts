import { apiClient } from "@/lib/api/client";
import type { Property, PropertyFilterInput, PropertyListResponse, CreatePropertyInput, UpdatePropertyInput } from "../types";

const BASE_URL = "/properties";

export const propertiesService = {
  async getProperties(params?: { page?: number; pageSize?: number; filters?: PropertyFilterInput }) {
    const response = await apiClient.get<PropertyListResponse>(BASE_URL, { params });
    return response.data;
  },

  async getProperty(id: string) {
    const response = await apiClient.get<Property>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async getPropertyBySlug(slug: string) {
    const response = await apiClient.get<Property>(`${BASE_URL}/slug/${slug}`);
    return response.data;
  },

  async createProperty(data: CreatePropertyInput) {
    const response = await apiClient.post<Property>(BASE_URL, data);
    return response.data;
  },

  async updateProperty(id: string, data: UpdatePropertyInput) {
    const response = await apiClient.patch<Property>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  async deleteProperty(id: string) {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async getPropertyImages(id: string) {
    const response = await apiClient.get<string[]>(`${BASE_URL}/${id}/images`);
    return response.data;
  },

  async incrementViews(id: string) {
    await apiClient.post(`${BASE_URL}/${id}/views`);
  },

  async getFeaturedProperties(limit: number = 10) {
    const response = await apiClient.get<Property[]>(`${BASE_URL}/featured`, { params: { limit } });
    return response.data;
  },

  async getRelatedProperties(id: string, limit: number = 5) {
    const response = await apiClient.get<Property[]>(`${BASE_URL}/${id}/related`, { params: { limit } });
    return response.data;
  },

  async searchProperties(query: string) {
    const response = await apiClient.get<PropertyListResponse>(`${BASE_URL}/search`, {
      params: { query },
    });
    return response.data;
  },

  async filterProperties(filters: PropertyFilterInput) {
    const response = await apiClient.post<PropertyListResponse>(`${BASE_URL}/filter`, filters);
    return response.data;
  },
};
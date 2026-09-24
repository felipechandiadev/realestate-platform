import { apiClient } from "@/lib/api/client";
import type { Property, PropertyFilterInput, PropertyListResponse, CreatePropertyInput, UpdatePropertyInput } from "../types";

const BASE_URL = "/properties";

export const propertiesService = {
  async getProperties(params?: { page?: number; pageSize?: number; filters?: PropertyFilterInput }) {
    // If there are advanced filters (bedrooms, bathrooms, parking, operators), use the sale/rent endpoints
    if (params?.filters && (
      params.filters.bedrooms !== undefined || 
      params.filters.bathrooms !== undefined || 
      params.filters.parkingSpaces !== undefined ||
      params.filters.state ||
      params.filters.typeProperty
    )) {
      const endpoint = params.filters.listingType === 'rent' ? `${BASE_URL}/rent` : `${BASE_URL}/sale`;
      
      // Build query params from filters
      const queryParams: any = {
        page: params.page || 1,
        limit: params.pageSize || 24,
        currency: params.filters.currency || 'CLP',
      };
      
      if (params.filters.bedrooms !== undefined && params.filters.bedrooms > 0) {
        queryParams.bedrooms = params.filters.bedrooms;
        queryParams.bedroomsOperator = params.filters.bedroomsOperator || 'gte';
      }
      if (params.filters.bathrooms !== undefined && params.filters.bathrooms > 0) {
        queryParams.bathrooms = params.filters.bathrooms;
        queryParams.bathroomsOperator = params.filters.bathroomsOperator || 'gte';
      }
      if (params.filters.parkingSpaces !== undefined && params.filters.parkingSpaces > 0) {
        queryParams.parkingSpaces = params.filters.parkingSpaces;
        queryParams.parkingSpacesOperator = params.filters.parkingSpacesOperator || 'gte';
      }
      if (params.filters.state) {
        queryParams.state = params.filters.state;
      }
      if (params.filters.city) {
        queryParams.city = params.filters.city;
      }
      if (params.filters.typeProperty) {
        queryParams.typeProperty = params.filters.typeProperty;
      }
      
      const response = await apiClient.get<any>(endpoint, { params: queryParams });
      // Convert response format if needed
      return {
        items: response.data.data || response.data,
        total: response.data.total || 0,
        page: response.data.page || 1,
        pageSize: response.data.limit || params.pageSize || 24,
      };
    }
    
    // Otherwise use the generic endpoint
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
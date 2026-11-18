import { apiClient } from "@/lib/api/client";
import type { Property, PropertyFilterInput, PropertyListResponse, CreatePropertyInput, UpdatePropertyInput } from "../types";

const BASE_URL = "/properties";

export const propertiesService = {
  async getProperties(params?: { page?: number; pageSize?: number; filters?: PropertyFilterInput }) {
    // El listado público siempre usa los endpoints de venta / arriendo. El endpoint genérico
    // GET /properties es solo para personal (da 401 a visitantes) y no entiende el objeto `filters`.
    const filters = params?.filters ?? {};
    const endpoint = filters.listingType === 'rent' ? `${BASE_URL}/rent` : `${BASE_URL}/sale`;

    // Build query params from filters
    const queryParams: Record<string, unknown> = {
      page: params?.page || 1,
      limit: params?.pageSize || 24,
      currency: filters.currency || 'CLP',
    };
    
    if (filters.bedrooms !== undefined && filters.bedrooms > 0) {
      queryParams.bedrooms = filters.bedrooms;
      queryParams.bedroomsOperator = filters.bedroomsOperator || 'gte';
    }
    if (filters.bathrooms !== undefined && filters.bathrooms > 0) {
      queryParams.bathrooms = filters.bathrooms;
      queryParams.bathroomsOperator = filters.bathroomsOperator || 'gte';
    }
    if (filters.parkingSpaces !== undefined && filters.parkingSpaces > 0) {
      queryParams.parkingSpaces = filters.parkingSpaces;
      queryParams.parkingSpacesOperator = filters.parkingSpacesOperator || 'gte';
    }
    if (filters.state) {
      queryParams.state = filters.state;
    }
    if (filters.city) {
      queryParams.city = filters.city;
    }
    if (filters.typeProperty) {
      queryParams.typeProperty = filters.typeProperty;
    }
    
    const response = await apiClient.get<
      Property[] | { data: Property[]; total?: number; page?: number; limit?: number }
    >(endpoint, { params: queryParams });
    // Convert response format if needed
    const body = response.data;
    if (Array.isArray(body)) {
      return { items: body, total: 0, page: 1, pageSize: params?.pageSize || 24 };
    }
    return {
      items: body.data,
      total: body.total || 0,
      page: body.page || 1,
      pageSize: body.limit || params?.pageSize || 24,
    };
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
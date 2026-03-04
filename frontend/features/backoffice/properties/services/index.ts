/**
 * @fileoverview HTTP service layer for property operations
 * Pure functions that communicate with the backend API
 * No React hooks, no side effects, no server session handling
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import type {
  Property,
  PropertyGridItem,
  CreatePropertyDto,
  UpdatePropertyDto,
  UpdatePropertyBasicDto,
  GridResponse,
  PropertyType,
  PropertyTypeCharacteristicsResponse,
  GridRequestParams,
  SinglePropertyResponse,
  PropertyListResponse,
} from '../types';

/**
 * Get authenticated access token from session
 * Throws if no session found
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
 * Make authenticated fetch request to backend API
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
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new Error(error);
  }

  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return (await response.text()) as any;
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = await response.json();
      return payload?.message || payload?.error || `Error ${response.status}`;
    }
    return (await response.text()) || `Error ${response.status}`;
  } catch {
    return `Error ${response.status}`;
  }
}

/**
 * Build query string from filter params
 */
function buildQueryString(params: GridRequestParams): URLSearchParams {
  const qs = new URLSearchParams();

  if (params.fields) qs.set('fields', params.fields);
  if (params.sort) qs.set('sort', params.sort);
  if (params.sortField) qs.set('sortField', params.sortField);
  if (typeof params.search === 'string') qs.set('search', params.search);
  if (typeof params.filters === 'string') qs.set('filters', params.filters);
  if (typeof params.filtration === 'boolean') qs.set('filtration', String(params.filtration));
  if (typeof params.pagination === 'boolean') qs.set('pagination', String(params.pagination));
  if (typeof params.page === 'number') qs.set('page', String(params.page));
  if (typeof params.limit === 'number') qs.set('limit', String(params.limit));

  return qs;
}

/**
 * Get paginated sale properties with grid layout
 * @param params Filter, sort, and pagination parameters
 */
export async function getSalePropertiesGridService(
  params: GridRequestParams = {}
): Promise<GridResponse<PropertyGridItem>> {
  const qs = buildQueryString(params);
  const url = `/properties/grid-sale?${qs.toString()}`;
  const response = await apiFetch<PropertyListResponse>(url);
  return response.data || { items: [], total: 0, page: 1, limit: 10, hasMore: false };
}

/**
 * Get paginated rent properties with grid layout
 */
export async function getRentPropertiesGridService(
  params: GridRequestParams = {}
): Promise<GridResponse<PropertyGridItem>> {
  const qs = buildQueryString(params);
  const url = `/properties/grid-rent?${qs.toString()}`;
  const response = await apiFetch<PropertyListResponse>(url);
  return response.data || { items: [], total: 0, page: 1, limit: 10, hasMore: false };
}

/**
 * List available rent properties (public)
 */
export async function listAvailableRentPropertiesService(
  params: GridRequestParams = {}
): Promise<GridResponse<PropertyGridItem>> {
  const qs = buildQueryString(params);
  const url = `/properties/available-rent?${qs.toString()}`;
  const response = await apiFetch<PropertyListResponse>(url);
  return response.data || { items: [], total: 0, page: 1, limit: 10, hasMore: false };
}

/**
 * Get total count of sale properties
 */
export async function getSalePropertiesCountService(): Promise<number> {
  const response = await apiFetch<{ count: number }>('/properties/count/sale');
  return response.count || 0;
}

/**
 * Get count of published sale properties
 */
export async function getPublishedPropertiesCountService(): Promise<number> {
  const response = await apiFetch<{ count: number }>('/properties/count/published');
  return response.count || 0;
}

/**
 * Get count of featured properties
 */
export async function getFeaturedPropertiesCountService(): Promise<number> {
  const response = await apiFetch<{ count: number }>('/properties/count/featured');
  return response.count || 0;
}

/**
 * Get available property types (cached by frontend)
 */
export async function listPropertyTypesService(): Promise<PropertyType[]> {
  const response = await apiFetch<{ data: PropertyType[] }>('/property-types');
  return response.data || [];
}

/**
 * Get characteristics for a property type
 */
export async function getPropertyTypeCharacteristicsService(
  typeId: string
): Promise<PropertyTypeCharacteristicsResponse> {
  const response = await apiFetch<{ data: PropertyTypeCharacteristicsResponse }>(
    `/property-types/${typeId}/characteristics`
  );
  return response.data || [];
}

/**
 * Create new property
 */
export async function createPropertyService(
  data: CreatePropertyDto
): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.data) {
    throw new Error('No se pudo crear la propiedad');
  }

  return response.data;
}

/**
 * Get single property by ID
 */
export async function getPropertyService(id: string): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(`/properties/${id}`);

  if (!response.data) {
    throw new Error('Propiedad no encontrada');
  }

  return response.data;
}

/**
 * Get full property details (includes all fields)
 */
export async function getFullPropertyService(id: string): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(`/properties/${id}?full=true`);

  if (!response.data) {
    throw new Error('Propiedad no encontrada');
  }

  return response.data;
}

/**
 * Update property with full DTO
 */
export async function updatePropertyService(
  id: string,
  data: UpdatePropertyDto
): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.data) {
    throw new Error('No se pudo actualizar la propiedad');
  }

  return response.data;
}

/**
 * Update property with basic fields only
 */
export async function updatePropertyBasicService(
  id: string,
  data: UpdatePropertyBasicDto
): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(`/properties/${id}/basic`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.data) {
    throw new Error('No se pudo actualizar la propiedad');
  }

  return response.data;
}

/**
 * Delete property
 */
export async function deletePropertyService(id: string): Promise<void> {
  await apiFetch(`/properties/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Toggle property published status
 */
export async function togglePropertyPublishedService(id: string): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(
    `/properties/${id}/published/toggle`,
    {
      method: 'PATCH',
    }
  );

  if (!response.data) {
    throw new Error('No se pudo cambiar el estado de publicación');
  }

  return response.data;
}

/**
 * Toggle property featured status
 */
export async function togglePropertyFeaturedService(id: string): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(
    `/properties/${id}/featured/toggle`,
    {
      method: 'PATCH',
    }
  );

  if (!response.data) {
    throw new Error('No se pudo cambiar el estado de destacado');
  }

  return response.data;
}

/**
 * Assign property to agent
 */
export async function assignPropertyAgentService(
  id: string,
  agentId: string
): Promise<Property> {
  const response = await apiFetch<SinglePropertyResponse>(
    `/properties/${id}/agent/${agentId}`,
    {
      method: 'PATCH',
    }
  );

  if (!response.data) {
    throw new Error('No se pudo asignar el agente');
  }

  return response.data;
}

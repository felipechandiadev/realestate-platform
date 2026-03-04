import { env } from '@/lib/env';

export interface FilterSalePropertiesDto {
  search?: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  bedroomsOperator?: 'lte' | 'eq' | 'gte';
  bathroomsOperator?: 'lte' | 'eq' | 'gte';
  parkingSpacesOperator?: 'lte' | 'eq' | 'gte';
  typeProperty?: string;
  state?: string;
  city?: string;
  currency?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface SalePropertiesResponse {
  data: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get published sale properties with filters
 */
export async function getSalePropertiesFiltered(
  filters: FilterSalePropertiesDto
): Promise<SalePropertiesResponse> {
  try {
    console.log('🔍 [getSalePropertiesFiltered] Starting with filters:', filters);

    // Build query parameters
    const params = new URLSearchParams();

    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.priceMin !== undefined) {
      params.append('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== undefined) {
      params.append('priceMax', filters.priceMax.toString());
    }
    if (filters.bedrooms !== undefined) {
      params.append('bedrooms', filters.bedrooms.toString());
      if (filters.bedroomsOperator) params.append('bedroomsOperator', filters.bedroomsOperator);
    }
    if (filters.bathrooms !== undefined) {
      params.append('bathrooms', filters.bathrooms.toString());
      if (filters.bathroomsOperator) params.append('bathroomsOperator', filters.bathroomsOperator);
    }
    if (filters.parkingSpaces !== undefined) {
      params.append('parkingSpaces', filters.parkingSpaces.toString());
      if (filters.parkingSpacesOperator) params.append('parkingSpacesOperator', filters.parkingSpacesOperator);
    }
    if (filters.typeProperty) {
      params.append('typeProperty', filters.typeProperty);
    }
    if (filters.state) {
      params.append('state', filters.state);
    }
    if (filters.city) {
      params.append('city', filters.city);
    }
    if (filters.currency) {
      params.append('currency', filters.currency);
    }

    if (filters.sort) {
      params.append('sort', filters.sort);
    }

    if (filters.page !== undefined) {
      params.append('page', filters.page.toString());
    }

    if (filters.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }

    const queryString = params.toString();
    const url = `${env.backendApiUrl}/properties/sale${queryString ? `?${queryString}` : ''}`;

    console.log('🌐 [getSalePropertiesFiltered] Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [getSalePropertiesFiltered] API error:', response.status, errorText);
      throw new Error(`Failed to fetch sale properties: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ [getSalePropertiesFiltered] Success:', {
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
      dataLength: data.data?.length || 0
    });

    return data;
  } catch (error) {
    console.error('❌ [getSalePropertiesFiltered] Error:', error);
    throw error;
  }
}
'use server';

import { env } from '@/lib/env';
import { revalidatePath } from 'next/cache';

export interface MediaItem {
  id: string;
  url: string;
  type?: string;
  format?: string;
}

export interface PropertyData {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  operationType: string;
  state: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  builtSquareMeters?: number | null;
  landSquareMeters?: number | null;
  parkingSpaces?: number | null;
  mainImageUrl: string;
  multimedia?: MediaItem[];
  createdAt: string;
  isFeatured?: boolean;
  propertyType?: {
    id: string;
    name: string;
    hasBedrooms?: boolean;
    hasBathrooms?: boolean;
    hasBuiltSquareMeters?: boolean;
    hasLandSquareMeters?: boolean;
    hasParkingSpaces?: boolean;
    hasFloors?: boolean;
    hasConstructionYear?: boolean;
  };
}

export interface PublishedPropertiesResponse {
  data: PropertyData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export async function getPublishedPropertiesFiltered(filters: {
  currency?: string;
  state?: string;
  city?: string;
  typeProperty?: string;
  operation?: string;
  page?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  bedroomsOperator?: 'lte' | 'eq' | 'gte';
  bathroomsOperator?: 'lte' | 'eq' | 'gte';
  parkingSpacesOperator?: 'lte' | 'eq' | 'gte';
  builtSquareMetersMin?: number;
  landSquareMetersMin?: number;
  constructionYearMin?: number;
  priceMin?: number;
  priceMax?: number;
}): Promise<PublishedPropertiesResponse | null> {
  try {
    const params = new URLSearchParams();

    // Convertir 'rent' -> 'RENT', 'sale' -> 'SALE'
    if (filters.operation) {
      const operationMap: { [key: string]: string } = {
        rent: 'RENT',
        sale: 'SALE',
      };
      const mappedOperation = operationMap[filters.operation.toLowerCase()] || filters.operation;
      params.append('operation', mappedOperation);
    }

    if (filters.currency && filters.currency !== 'all') params.append('currency', filters.currency);
    if (filters.state) params.append('state', filters.state);
    if (filters.city) params.append('city', filters.city);
    if (filters.typeProperty) params.append('typeProperty', filters.typeProperty);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.priceMin !== undefined && filters.priceMin > 0) {
      params.append('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== undefined && filters.priceMax > 0) {
      params.append('priceMax', filters.priceMax.toString());
    }
    if (filters.bedrooms && filters.bedrooms > 0) {
      params.append('bedrooms', filters.bedrooms.toString());
      params.append('bedroomsOperator', filters.bedroomsOperator || 'gte');
    }
    if (filters.bathrooms && filters.bathrooms > 0) {
      params.append('bathrooms', filters.bathrooms.toString());
      params.append('bathroomsOperator', filters.bathroomsOperator || 'gte');
    }
    if (filters.parkingSpaces && filters.parkingSpaces > 0) {
      params.append('parkingSpaces', filters.parkingSpaces.toString());
      params.append('parkingSpacesOperator', filters.parkingSpacesOperator || 'gte');
    }
    if (filters.builtSquareMetersMin && filters.builtSquareMetersMin > 0) params.append('builtSquareMetersMin', filters.builtSquareMetersMin.toString());
    if (filters.landSquareMetersMin && filters.landSquareMetersMin > 0) params.append('landSquareMetersMin', filters.landSquareMetersMin.toString());
    if (filters.constructionYearMin && filters.constructionYearMin > 0) params.append('constructionYearMin', filters.constructionYearMin.toString());

    const url = `${env.backendApiUrl}/properties/published/filtered?${params.toString()}`;

    console.log('📡 Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      const errorMsg = `Error fetching published properties: ${response.status} ${response.statusText} - ${errorText}`;
      console.error('❌', errorMsg);
      console.log('📍 URL intentado:', url);
      return null;
    }

    const rawData = await response.json();
    
    console.log('📦 Raw data from backend (first property mainImageUrl):', rawData.data?.[0]?.mainImageUrl);
    
    // Helper: Asegurar URLs absolutas
    const ensureAbsoluteUrl = (url: string | null | undefined): string => {
      if (!url) return '';
      
      console.log('🔗 Converting URL:', url);
      
      // Si ya es absoluta, devolver tal cual
      if (url.startsWith('http://') || url.startsWith('https://')) {
        console.log('✅ Already absolute:', url);
        return url;
      }
      
      // Si es relativa, prepend backend URL
      if (url.startsWith('/')) {
        const absolute = `${env.backendApiUrl}${url}`;
        console.log('✅ Made absolute:', absolute);
        return absolute;
      }
      
      console.log('⚠️ Unexpected URL format:', url);
      return url;
    };
    
    // Mapear los datos del backend al formato esperado
    const mappedData: PropertyData[] = (rawData.data || []).map((prop: any) => ({
      id: prop.id,
      title: prop.title,
      description: prop.description,
      price: prop.price,
      currency: prop.currencyPrice || 'CLP',
      operationType: prop.operationType,
      state: prop.state,
      city: prop.city,
      address: prop.address,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      totalArea: prop.builtSquareMeters,
      builtSquareMeters: prop.builtSquareMeters ?? null,
      landSquareMeters: prop.landSquareMeters ?? null,
      parkingSpaces: prop.parkingSpaces ?? null,
      mainImageUrl: ensureAbsoluteUrl(prop.mainImageUrl),
      multimedia: (prop.multimedia || []).map((m: any) => ({
        id: m.id,
        url: ensureAbsoluteUrl(m.url),
        type: m.type,
        format: m.format,
      })),
      createdAt: prop.createdAt,
      isFeatured: prop.isFeatured || false,
      propertyType: prop.propertyType ? {
        id: prop.propertyType.id,
        name: prop.propertyType.name,
        hasBedrooms: prop.propertyType.hasBedrooms,
        hasBathrooms: prop.propertyType.hasBathrooms,
        hasBuiltSquareMeters: prop.propertyType.hasBuiltSquareMeters,
        hasLandSquareMeters: prop.propertyType.hasLandSquareMeters,
        hasParkingSpaces: prop.propertyType.hasParkingSpaces,
        hasFloors: prop.propertyType.hasFloors,
        hasConstructionYear: prop.propertyType.hasConstructionYear,
      } : undefined,
    }));

    console.log('✅ Properties fetched:', mappedData.length, 'items');
    
    return {
      data: mappedData,
      pagination: rawData.pagination || {},
    };
  } catch (error) {
    console.error('Failed to fetch published properties:', error);
    return null;
  }
}

export async function refreshPortalProperties() {
  'use server';
  revalidatePath('/portal');
}

/**
 * Get price range (min/max) for published properties
 * @param operationType Optional filter by SALE or RENT
 */
export async function getPriceRange(operationType?: 'SALE' | 'RENT'): Promise<{ minPrice: number; maxPrice: number } | null> {
  'use server';
  
  try {
    const params = new URLSearchParams();
    if (operationType) {
      params.append('operationType', operationType);
    }

    const url = `${env.backendApiUrl}/properties/price-range${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('🔍 [getPriceRange] Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('❌ [getPriceRange] Failed to fetch:', response.status);
      return { minPrice: 0, maxPrice: 10000000 };
    }

    const data = await response.json();
    console.log('✅ [getPriceRange] Received:', data);
    
    return {
      minPrice: data.minPrice || 0,
      maxPrice: data.maxPrice || 10000000,
    };
  } catch (error) {
    console.error('❌ [getPriceRange] Error:', error);
    return { minPrice: 0, maxPrice: 10000000 };
  }
}

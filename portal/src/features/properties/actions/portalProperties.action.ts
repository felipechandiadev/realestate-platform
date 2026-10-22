'use server';

import { env } from '@/lib/env';
import { revalidatePath } from 'next/cache';

export interface MediaItem {
  id: string;
  url: string;
  type?: string;
  format?: string;
  variants?: Array<{
    id?: string;
    variantType: string;
    format: 'webp' | 'jpeg' | 'png';
    width: number;
    height: number;
    size: number;
    url: string;
  }>;
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
  otherFeatures?: string[];
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
  typeIds?: string;
  operation?: string;
  page?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  bedroomsOperator?: 'lte' | 'eq' | 'gte';
  bathroomsOperator?: 'lte' | 'eq' | 'gte';
  parkingSpacesOperator?: 'lte' | 'eq' | 'gte';
  builtSquareMetersMin?: number;
  builtSquareMetersMax?: number;
  landSquareMetersMin?: number;
  landSquareMetersMax?: number;
  constructionYearMin?: number;
  priceMin?: number;
  priceMax?: number;
  otherFeatures?: string;
  features?: string;
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
    if (filters.typeIds) params.append('typeIds', filters.typeIds);
    else if (filters.typeProperty) params.append('typeProperty', filters.typeProperty);
    if (filters.page) params.append('page', filters.page.toString());
    params.append('limit', '9'); // Items per page for portal
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
    if (filters.builtSquareMetersMin && filters.builtSquareMetersMin > 0) {
      params.append('builtSquareMetersMin', filters.builtSquareMetersMin.toString());
    }
    if (filters.builtSquareMetersMax && filters.builtSquareMetersMax > 0) {
      params.append('builtSquareMetersMax', filters.builtSquareMetersMax.toString());
    }
    if (filters.landSquareMetersMin && filters.landSquareMetersMin > 0) {
      params.append('landSquareMetersMin', filters.landSquareMetersMin.toString());
    }
    if (filters.landSquareMetersMax && filters.landSquareMetersMax > 0) {
      params.append('landSquareMetersMax', filters.landSquareMetersMax.toString());
    }
    if (filters.constructionYearMin && filters.constructionYearMin > 0) {
      params.append('constructionYearMin', filters.constructionYearMin.toString());
    }
    const featuresCsv = filters.otherFeatures || filters.features;
    if (featuresCsv) params.append('otherFeatures', featuresCsv);

    const url = `${env.backendApiUrl}/properties/published/filtered?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60, tags: ['public-listings'] },
    });

    if (!response.ok) {
      return null;
    }

    const rawData = await response.json();

    // Helper: Asegurar URLs absolutas
    const ensureAbsoluteUrl = (url: string | null | undefined): string => {
      if (!url) return '';

      // Si ya es absoluta, devolver tal cual
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }

      // Si es relativa, prepend backend URL
      if (url.startsWith('/')) {
        return `${env.backendApiUrl}${url}`;
      }

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
      otherFeatures: Array.isArray(prop.otherFeatures) ? prop.otherFeatures : [],
      mainImageUrl: ensureAbsoluteUrl(prop.mainImageUrl),
      multimedia: (prop.multimedia || []).map((m: any) => ({
        id: m.id,
        url: ensureAbsoluteUrl(m.url),
        type: m.type,
        format: m.format,
        variants: (m.variants || []).map((v: any) => ({
          id: v.id,
          variantType: v.variantType,
          format: v.format,
          width: v.width,
          height: v.height,
          size: v.size,
          url: ensureAbsoluteUrl(v.url),
        })),
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

    return {
      data: mappedData,
      pagination: {
        total: rawData.total || 0,
        page: rawData.page || 1,
        limit: rawData.limit || 9,
        totalPages: rawData.totalPages || 1,
        hasNextPage: rawData.hasNextPage || false,
        hasPrevPage: rawData.hasPrevPage || false,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('fetch failed')) {
      return null;
    }
    console.warn('[getPublishedPropertiesFiltered] Request failed');
    return null;
  }
}

export type FilterBounds = {
  price: { min: number; max: number };
  builtSquareMeters: { min: number; max: number };
  landSquareMeters: { min: number; max: number };
  constructionYear: { min: number; max: number };
};

const DEFAULT_FILTER_BOUNDS: FilterBounds = {
  price: { min: 0, max: 10_000_000 },
  builtSquareMeters: { min: 0, max: 1_000 },
  landSquareMeters: { min: 0, max: 5_000 },
  constructionYear: { min: 1950, max: new Date().getFullYear() },
};

/**
 * Fetch min/max bounds for sidebar range sliders.
 */
export async function getFilterBounds(opts?: {
  operation?: string;
  currency?: string;
}): Promise<FilterBounds> {
  try {
    const params = new URLSearchParams();
    if (opts?.operation) {
      const operationMap: Record<string, string> = {
        rent: 'RENT',
        sale: 'SALE',
        RENT: 'RENT',
        SALE: 'SALE',
      };
      const mapped = operationMap[opts.operation] || opts.operation.toUpperCase();
      if (mapped === 'SALE' || mapped === 'RENT') {
        params.set('operationType', mapped);
      }
    }
    if (opts?.currency && opts.currency !== 'all') {
      params.set('currency', opts.currency);
    }

    const qs = params.toString();
    const url = `${env.backendApiUrl}/properties/filter-bounds${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) return DEFAULT_FILTER_BOUNDS;

    const data = await response.json();
    return {
      price: {
        min: Number(data?.price?.min) || DEFAULT_FILTER_BOUNDS.price.min,
        max: Number(data?.price?.max) || DEFAULT_FILTER_BOUNDS.price.max,
      },
      builtSquareMeters: {
        min: Number(data?.builtSquareMeters?.min) || DEFAULT_FILTER_BOUNDS.builtSquareMeters.min,
        max: Number(data?.builtSquareMeters?.max) || DEFAULT_FILTER_BOUNDS.builtSquareMeters.max,
      },
      landSquareMeters: {
        min: Number(data?.landSquareMeters?.min) || DEFAULT_FILTER_BOUNDS.landSquareMeters.min,
        max: Number(data?.landSquareMeters?.max) || DEFAULT_FILTER_BOUNDS.landSquareMeters.max,
      },
      constructionYear: {
        min: Number(data?.constructionYear?.min) || DEFAULT_FILTER_BOUNDS.constructionYear.min,
        max: Number(data?.constructionYear?.max) || DEFAULT_FILTER_BOUNDS.constructionYear.max,
      },
    };
  } catch {
    return DEFAULT_FILTER_BOUNDS;
  }
}

export async function refreshPortalProperties() {
  'use server';
  revalidatePath('/');
}

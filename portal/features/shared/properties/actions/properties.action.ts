'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { refreshAccessToken, logoutAction } from '@/features/shared/auth/actions/auth.action';
import { cookies } from 'next/headers';
import type { MediaItem } from '@/src/features/properties/actions/portalProperties.action';

export type GridSort = 'asc' | 'desc';

export interface SalePropertiesGridParams {
  fields?: string; // comma-separated list of fields
  sort?: GridSort;
  sortField?: string;
  search?: string;
  filtration?: boolean;
  filters?: string; // e.g. "city-Las Condes,typeName-Departamento"
  pagination?: boolean;
  page?: number;
  limit?: number;
}

export interface SalePropertyGridRow {
  id: string;
  code?: string;
  mainImageUrl?: string | null;
  title?: string;
  status?: string;
  operationType?: string;
  typeName?: string;
  characteristics?: string;
  assignedAgentName?: string;
  creatorName?: string;
  city?: string;
  state?: string;
  priceDisplay?: string;
  price?: number;
  currencyPrice?: 'CLP' | 'UF';
  createdAt?: string;
  updatedAt?: string;
  // allow additional fields without strict typing
  [key: string]: unknown;
}

export type SalePropertiesGridResponse =
  | SalePropertyGridRow[]
  | { data: SalePropertyGridRow[]; total: number; page: number; limit: number; totalPages: number };

export interface RentPropertiesGridParams {
  fields?: string; // comma-separated list of fields
  sort?: GridSort;
  sortField?: string;
  search?: string;
  filtration?: boolean;
  filters?: string; // e.g. "city-Las Condes,typeName-Departamento"
  pagination?: boolean;
  page?: number;
  limit?: number;
}

export interface RentPropertyGridRow {
  id: string;
  code?: string;
  title?: string;
  status?: string;
  operationType?: string;
  typeName?: string;
  characteristics?: string;
  assignedAgentName?: string;
  creatorName?: string;
  city?: string;
  state?: string;
  priceDisplay?: string;
  price?: number;
  currencyPrice?: 'CLP' | 'UF';
  createdAt?: string;
  updatedAt?: string;
  // allow additional fields without strict typing
  [key: string]: unknown;
}

export type RentPropertiesGridResponse =
  | RentPropertyGridRow[]
  | { data: RentPropertyGridRow[]; total: number; page: number; limit: number; totalPages: number };

export interface AvailableRentProperty {
  id: string;
  code?: string | null;
  title?: string | null;
  status?: string | null;
  city?: string | null;
  state?: string | null;
  price?: number | null;
  currencyPrice?: 'CLP' | 'UF' | null;
  propertyTypeId?: string | null;
  propertyTypeName?: string | null;
  mainImageUrl?: string | null;
}

export interface ListAvailableRentPropertiesParams {
  search?: string;
  limit?: number;
}

export interface PropertyTypeWithFeatures {
  id: string;
  name: string;
  hasBedrooms: boolean;
  hasBathrooms: boolean;
  hasBuiltSquareMeters: boolean;
  hasLandSquareMeters: boolean;
  hasParkingSpaces: boolean;
  hasFloors: boolean;
  hasConstructionYear: boolean;
}

export async function listPropertyTypesPublic(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    console.log('📥 [listPropertyTypesPublic] Starting (no auth required)...');
    const url = `${env.backendApiUrl}/property-types/public/list`;
    console.log('🌐 [listPropertyTypesPublic] Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [listPropertyTypesPublic] Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('❌ [listPropertyTypesPublic] Error response:', errorData);
      return { 
        success: false, 
        error: errorData?.message || `HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    console.log('✅ [listPropertyTypesPublic] Data received:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [listPropertyTypesPublic] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get property type characteristics by ID (public - no auth required)
 * Used for the public rent-property form to load dynamic characteristics
 */
export async function getPropertyTypeCharacteristicsPublic(id: string): Promise<{
  success: boolean;
  data?: PropertyTypeWithFeatures;
  error?: string;
}> {
  try {
    console.log('📥 [getPropertyTypeCharacteristicsPublic] Fetching characteristics for type:', id);
    const url = `${env.backendApiUrl}/property-types/public/${id}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('❌ [getPropertyTypeCharacteristicsPublic] Error response:', errorData);
      return {
        success: false,
        error: errorData?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    console.log('✅ [getPropertyTypeCharacteristicsPublic] Data received:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [getPropertyTypeCharacteristicsPublic] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function listPropertyTypes(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    console.log('📥 [listPropertyTypes] Starting...');
    const session = await getServerSession(authOptions);
    console.log('🔐 [listPropertyTypes] Session:', session?.user?.email, 'hasToken:', !!session?.accessToken);
    
    if (!session?.accessToken) {
      console.warn('⚠️ [listPropertyTypes] No access token');
      return { success: false, error: 'No authenticated' };
    }

    const url = `${env.backendApiUrl}/property-types`;
    console.log('🌐 [listPropertyTypes] Fetching from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [listPropertyTypes] Response status:', response.status);

    // Si es 401, redirigir a inicio
    if (response.status === 401) {
      console.warn('⚠️ [listPropertyTypes] Unauthorized (401)');
      redirect('/');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('❌ [listPropertyTypes] Error response:', errorData);
      return { 
        success: false, 
        error: errorData?.message || `HTTP ${response.status}` 
      };
    }

    const data = await response.json();
    console.log('✅ [listPropertyTypes] Data received:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ [listPropertyTypes] Error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function getPropertyTypeCharacteristics(id: string): Promise<{
  success: boolean;
  data?: PropertyTypeWithFeatures;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/property-types/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `HTTP ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching property type characteristics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


export interface PublishPropertyPayload {
  title: string;
  propertyTypeId: string;
  operationType: string;
  builtSquareMeters?: number;
  landSquareMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floors?: number;
  constructionYear?: number;
  otherFeatures?: string[];
  price: string;
  currencyPrice: string;
  region: string;
  city: string;
  address: string;
  coordinates?: { latitude: number; longitude: number };
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  multimediaFiles?: File[];
  accessToken?: string;
}


/** Propiedad creada por `POST /properties/...` (el portal solo usa el `id`). */
export interface PublishedPropertyRecord {
  id: string;
  [key: string]: unknown;
}
export async function publishPropertyPublic(
  payload: PublishPropertyPayload,
): Promise<{ success: boolean; data?: PublishedPropertyRecord; error?: string }> {
  try {
    console.log('📤 [publishPropertyPublic] Iniciando publicación de propiedad (público)');

    // Crear FormData para enviar archivos y datos
    const formData = new FormData();

    // Agregar archivos de multimedia
    if (payload.multimediaFiles && payload.multimediaFiles.length > 0) {
      console.log('📸 [publishPropertyPublic] Agregando', payload.multimediaFiles.length, 'archivos de multimedia');
      payload.multimediaFiles.forEach((file) => {
        formData.append('multimediaFiles', file);
      });
    }

    // Agregar datos de la propiedad como JSON string
    const propertyData = {
      title: payload.title,
      propertyTypeId: payload.propertyTypeId,
      status: 'REQUEST', // Status por defecto para propiedades públicas
      operationType: payload.operationType || 'SALE',
      builtSquareMeters: payload.builtSquareMeters,
      landSquareMeters: payload.landSquareMeters,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      parkingSpaces: payload.parkingSpaces,
      floors: payload.floors,
      constructionYear: payload.constructionYear,
      otherFeatures: Array.isArray(payload.otherFeatures) ? payload.otherFeatures : [],
      price: payload.price,
      currencyPrice: payload.currencyPrice,
      state: payload.region,
      city: payload.city,
      address: payload.address,
      location: payload.coordinates ? {
        lat: payload.coordinates.latitude,
        lng: payload.coordinates.longitude
      } : undefined,
      contactName: payload.contactName,
      contactPhone: payload.contactPhone,
      contactEmail: payload.contactEmail,
    };

    formData.append('data', JSON.stringify(propertyData));

    console.log('🌐 [publishPropertyPublic] Enviando a:', `${env.backendApiUrl}/properties/public/publish`);

    const headers: Record<string, string> = {};
    if (payload.accessToken) {
      headers['Authorization'] = `Bearer ${payload.accessToken}`;
    }

    const response = await fetch(
      `${env.backendApiUrl}/properties/public/publish`,
      {
        method: 'POST',
        headers,
        body: formData,
      },
    );

    console.log('📡 [publishPropertyPublic] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error('❌ [publishPropertyPublic] Error:', error);
      return {
        success: false,
        error: error?.message || `HTTP ${response.status}`,
      };
    }

    const propertyCreated = await response.json();
    console.log('✅ [publishPropertyPublic] Propiedad publicada:', propertyCreated.id);
    return { success: true, data: propertyCreated };
  } catch (error) {
    console.error('❌ [publishPropertyPublic] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function publishProperty(
  payload: PublishPropertyPayload,
): Promise<{ success: boolean; data?: PublishedPropertyRecord; error?: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    console.log('[publishProperty] Iniciando publicación de propiedad');

    // Paso 1: Crear la propiedad SIN multimedia primero
    console.log('[publishProperty] Creando solicitud de propiedad');
    
    const response = await fetch(
      `${env.backendApiUrl}/properties/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          title: payload.title,
          propertyTypeId: payload.propertyTypeId,
          operationType: payload.operationType || 'SALE',
          builtSquareMeters: payload.builtSquareMeters,
          landSquareMeters: payload.landSquareMeters,
          bedrooms: payload.bedrooms,
          bathrooms: payload.bathrooms,
          parkingSpaces: payload.parkingSpaces,
          floors: payload.floors,
          constructionYear: payload.constructionYear,
          otherFeatures: Array.isArray(payload.otherFeatures) ? payload.otherFeatures : [],
          price: payload.price,
          currencyPrice: payload.currencyPrice,
          region: payload.region,
          city: payload.city,
          address: payload.address,
          coordinates: payload.coordinates,
          contactName: payload.contactName,
          contactPhone: payload.contactPhone,
          contactEmail: payload.contactEmail,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      console.error('[publishProperty] Error al crear propiedad:', error);
      return {
        success: false,
        error: error?.message || 'Error al crear la solicitud',
      };
    }

    const propertyData = await response.json();
    const propertyId = propertyData.id;
    console.log('[publishProperty] Propiedad creada:', propertyId);

    // Paso 2: Subir multimedia si existen archivos
    if (payload.multimediaFiles && payload.multimediaFiles.length > 0) {
      console.log('[publishProperty] Subiendo', payload.multimediaFiles.length, 'imágenes');
      
      const formData = new FormData();
      payload.multimediaFiles.forEach((file) => {
        formData.append('files', file);
      });

      const uploadResponse = await fetch(
        `${env.backendApiUrl}/properties/${propertyId}/multimedia`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: formData,
        },
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        console.error('[publishProperty] Error al subir imágenes:', errorData);
        // No retornamos error aquí, la propiedad ya fue creada
        // Solo logueamos el error
      } else {
        const uploadedData = await uploadResponse.json();
        console.log('[publishProperty] Imágenes subidas:', uploadedData);
      }
    }

    console.log('[publishProperty] ✅ Propiedad publicada:', propertyId);
    return { success: true, data: propertyData };
  } catch (error) {
    console.error('[publishProperty] Error:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error al publicar la propiedad',
    };
  }
}

// ===================================
// Property Entity Interface
// ===================================

export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  currencyPrice: 'CLP' | 'UF';
  status: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RESERVED';
  operationType: 'RENT' | 'SALE';
  availableFrom?: string;
  publicDescription?: string;
  internalNotes?: string;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  propertyType: {
    id: string;
    name: string;
  };
  assignedAgent?: {
    id: string;
    username: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
  };
  location?: {
    country?: string;
    region?: string;
    province?: string;
    city?: string;
    neighborhood?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  characteristics?: {
    totalArea?: number;
    builtArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    floors?: number;
    amenities?: string[];
    orientation?: string;
    condition?: string;
    yearBuilt?: number;
  };
  multimedia?: Array<{
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR';
    isMain?: boolean;
    order?: number;
  }>;
}

export interface CreatePropertyDto {
  // Datos generales
  title: string;
  description?: string;
  status: number; // Número que se mapea a string en el backend
  operationType: number; // Número que se mapea a string en el backend
  propertyTypeId?: string;

  // Ubicación  
  state: string; // ID extraído del objeto
  city: string; // ID extraído del objeto
  address?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };

  // Características (todas opcionales ahora)
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floors?: number;
  builtSquareMeters?: number;
  landSquareMeters?: number;
  constructionYear?: number;

  // Precio (opcionales)
  price?: string;
  currencyPrice?: number; // Número que se mapea a string en el backend

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Multimedia
  multimedia?: Array<{
    id?: string;
    url: string;
    filename: string;
    type: 'image' | 'video';
    order?: number;
  }>;

  // Imagen principal
  mainImageUrl?: string;

  // Internos
  internalNotes?: string;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  price?: number;
  currencyPrice?: 'CLP' | 'UF';
  status?: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RESERVED';
  operationType?: 'RENT' | 'SALE';
  propertyTypeId?: string;
  assignedAgentId?: string;
  availableFrom?: string;
  publicDescription?: string;
  internalNotes?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  location?: {
    country?: string;
    region?: string;
    province?: string;
    city?: string;
    neighborhood?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  characteristics?: {
    totalArea?: number;
    builtArea?: number;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    floors?: number;
    amenities?: string[];
    orientation?: string;
    condition?: string;
    yearBuilt?: number;
  };
}

export interface UpdatePropertyBasicDto {
  title?: string;
  description?: string;
  status?: string; // backend enum string
  operationType?: string; // backend enum string
  propertyTypeId?: string;
  assignedAgentId?: string;
  isFeatured?: boolean;
  price?: number;
  currencyPrice?: string;
}

/**
 * Get a property by ID
 */
export async function getProperty(id: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch property: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update a property
 */
export async function updateProperty(id: string, data: UpdatePropertyDto): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to update property: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete a property (soft delete)
 */
export async function deleteProperty(id: string): Promise<void> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      throw new Error('No authenticated');
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Failed to delete property: ${response.status}`
      );
    }

    // Return nothing on success
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export interface UpdatePropertyCharacteristicsDto {
  builtSquareMeters?: number;
  landSquareMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floors?: number;
  constructionYear?: number;
}

export interface UpdatePropertyLocationDto {
  address?: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdatePropertyPriceDto {
  price?: number;
  currencyPrice?: 'CLP' | 'UF';
  seoTitle?: string;
  seoDescription?: string;
}

export interface PublicPropertyItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  operationType: 'RENT' | 'SALE';
  price: number;
  currencyPrice: 'CLP' | 'UF';
  city?: string;
  state?: string;
  mainImageUrl?: string;
  publishedAt?: string;
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
  bedrooms?: number;
  bathrooms?: number;
  builtSquareMeters?: number;
  landSquareMeters?: number;
  parkingSpaces?: number;
  isFeatured?: boolean;
  multimedia?: MediaItem[];
}

type RawPublicPropertyItem = Omit<PublicPropertyItem, 'mainImageUrl' | 'multimedia'> & {
  mainImageUrl?: string | null;
  multimedia?: MediaItem[] | null;
};

const toAbsoluteMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${env.backendApiUrl}${url}`;
  return url;
};

/** Normaliza el listado público de propiedades: URLs absolutas en imagen principal, multimedia y variantes. */
function normalizePublicProperties(raw: unknown): PublicPropertyItem[] {
  const list = Array.isArray(raw) ? (raw as RawPublicPropertyItem[]) : [];
  return list.map((property) => ({
    ...property,
    mainImageUrl: toAbsoluteMediaUrl(property.mainImageUrl),
    multimedia: (property.multimedia || []).map((m) => ({
      ...m,
      url: toAbsoluteMediaUrl(m.url) ?? '',
      variants: (m.variants || []).map((v) => ({
        ...v,
        url: toAbsoluteMediaUrl(v.url) ?? '',
      })),
    })),
  }));
}

/**
 * Public: list published properties that are featured (highlighted)
 */
export async function getPublishedFeaturedPropertiesPublic(): Promise<{
  success: boolean;
  data?: PublicPropertyItem[];
  error?: string;
}> {
  try {
    const res = await fetch(`${env.backendApiUrl}/properties/public/featured`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 60, tags: ['public-listings', 'public-featured'] },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch featured properties: ${res.status}`,
      };
    }

  const payload = await res.json();
  const rawData = Array.isArray(payload) ? payload : payload?.data ?? [];

  const data = normalizePublicProperties(rawData);

  return { success: true, data };
  } catch (error) {
    console.error('Error fetching published featured properties (public):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Public: Get a single published property by ID (no token required)
 * 
 * NOTE: This function is duplicated in app/portal/properties/property/[id]/actions.ts
 * to avoid importing auth dependencies on public pages. Use that one instead for public pages.
 */
export async function getPublishedPropertyPublic(id: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const res = await fetch(`${env.backendApiUrl}/properties/public/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch property: ${res.status}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching published property (public):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Toggle favorite for a property (uses backend endpoint)
 */
export async function togglePropertyFavorite(propertyId: string): Promise<{ success: boolean; isFavorited?: boolean; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;
    const userId = session?.user?.id ?? 'anonymous';

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/toggle-favorite`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    const payload = await res.json();
    return { success: true, isFavorited: payload?.isFavorited };
  } catch (error) {
    console.error('[togglePropertyFavorite] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Revalidate a property route (server-side cache revalidation)
 */
export async function revalidatePropertyRoute(path: string): Promise<{ success: boolean; error?: string }> {
  try {
    // path expected to be a route like '/portal/properties/property/123'
    revalidatePath(path);
    return { success: true };
  } catch (error) {
    console.error('[revalidatePropertyRoute] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Wrapper for fetching published featured properties with pagination
 */
export async function getPublishedFeaturedProperties(
  page = 1,
  limit = 9,
): Promise<{
  success: boolean;
  data?: PublicPropertyItem[];
  pagination?: { total: number; page: number; limit: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
  error?: string;
}> {
  try {
    const safeLimit = Math.min(16, Math.max(1, limit));
    const res = await fetch(
      `${env.backendApiUrl}/properties/public/featured/paginated?page=${page}&limit=${safeLimit}`,
      {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    },
    );

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    const payload = await res.json();
    const rawData = payload?.data ?? payload ?? [];
    const normalizedData = normalizePublicProperties(rawData);

    const pageNum = Number(payload?.page) || page;
    const limitNum = Number(payload?.limit) || safeLimit;
    const total = Number(payload?.total) || normalizedData.length;
    const totalPages =
      Number(payload?.totalPages) ||
      Math.max(1, Math.ceil(total / Math.max(1, limitNum)));

    return {
      success: true,
      data: normalizedData,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('fetch failed')) {
      return { success: false, error: 'Backend unavailable' };
    }
    console.warn('[getPublishedFeaturedProperties] Request failed');
    return { success: false, error: 'Unknown error' };
  }
}

/**
 * Obtiene las propiedades de un usuario específico
 */
export async function getUserProperties(userId: string, params: SalePropertiesGridParams = {}): Promise<SalePropertiesGridResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    throw new Error('No hay una sesión activa');
  }

  const url = new URL(`${env.backendApiUrl}/properties/user/${userId}/grid`);

  // attach params
  if (params.fields) url.searchParams.set('fields', params.fields);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.sortField) url.searchParams.set('sortField', params.sortField);
  if (params.page !== undefined) url.searchParams.set('page', String(params.page));
  if (params.limit !== undefined) url.searchParams.set('limit', String(params.limit));
  url.searchParams.set('pagination', 'true');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Error al obtener propiedades del usuario: ${response.status}`);
  }

  return response.json();
}


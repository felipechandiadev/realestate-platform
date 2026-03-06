'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { refreshAccessToken, logoutAction } from '@/features/shared/auth/actions/auth.action';
import { cookies } from 'next/headers';

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
  [key: string]: any;
}

export type SalePropertiesGridResponse =
  | SalePropertyGridRow[]
  | { data: SalePropertyGridRow[]; total: number; page: number; limit: number; totalPages: number };

export async function getSalePropertiesGrid(
  params: SalePropertiesGridParams = {}
): Promise<SalePropertiesGridResponse> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa para consultar propiedades.');
  }

  console.log('[DEBUG] getSalePropertiesGrid - params.filters received:', params.filters);
  console.log('[DEBUG] getSalePropertiesGrid - params.filtration:', params.filtration);

  const url = new URL(`${env.backendApiUrl}/properties/grid-sale`);

  // map boolean flags to 'true'|'false' strings
  const setBoolParam = (key: string, value?: boolean) => {
    if (typeof value === 'boolean') url.searchParams.set(key, value ? 'true' : 'false');
  };

  // attach params
  if (params.fields) url.searchParams.set('fields', params.fields);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.sortField) url.searchParams.set('sortField', params.sortField);
  if (typeof params.search === 'string') url.searchParams.set('search', params.search);
  if (typeof params.filters === 'string') url.searchParams.set('filters', params.filters);
  setBoolParam('filtration', params.filtration);
  setBoolParam('pagination', params.pagination);
  if (typeof params.page === 'number') url.searchParams.set('page', String(params.page));
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));

  console.log('[DEBUG] getSalePropertiesGrid - Final URL sent to backend:', url.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  console.log('[DEBUG] getSalePropertiesGrid - Response status:', response.status);
  if (!response.ok) {
    let message = `Error ${response.status} al obtener propiedades en venta`;
    try {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const payload = await response.json();
        // common payload shapes
        message = payload?.message || payload?.error || message;
        // sometimes validation errors come as an array or nested structure
        if (!message && payload?.errors && Array.isArray(payload.errors)) {
          message = payload.errors.map((e: any) => e?.message || JSON.stringify(e)).join('; ');
        }
      } else {
        const text = await response.text().catch(() => '');
        if (text) message = text;
      }
    } catch (err) {
      console.warn('[getSalePropertiesGrid] Failed to parse error body:', err);
    }

    throw new Error(message);
  }

  // Parse success payload safely
  let result: any;
  try {
    const text = await response.text();
    if (!text) {
      console.warn('[getSalePropertiesGrid] Empty response body');
      result = [];
    } else {
      result = JSON.parse(text);
    }
  } catch (err) {
    console.error('[getSalePropertiesGrid] Failed to parse response JSON:', err);
    throw new Error('Error al procesar la respuesta del servidor');
  }

  console.log('[DEBUG] getSalePropertiesGrid - Response data type:', Array.isArray(result) ? 'array' : typeof result, 'keys:', result && typeof result === 'object' ? Object.keys(result) : 'n/a');
  return result as SalePropertiesGridResponse;
}

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
  [key: string]: any;
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

export async function getRentPropertiesGrid(
  params: RentPropertiesGridParams = {}
): Promise<RentPropertiesGridResponse> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa para consultar propiedades.');
  }

  console.log('[DEBUG] getRentPropertiesGrid - params.filters received:', params.filters);
  console.log('[DEBUG] getRentPropertiesGrid - params.filtration:', params.filtration);

  const url = new URL(`${env.backendApiUrl}/properties/grid-rent`);

  // map boolean flags to 'true'|'false' strings
  const setBoolParam = (key: string, value?: boolean) => {
    if (typeof value === 'boolean') url.searchParams.set(key, value ? 'true' : 'false');
  };

  // attach params
  if (params.fields) url.searchParams.set('fields', params.fields);
  if (params.sort) url.searchParams.set('sort', params.sort);
  if (params.sortField) url.searchParams.set('sortField', params.sortField);
  if (typeof params.search === 'string') url.searchParams.set('search', params.search);
  if (typeof params.filters === 'string') url.searchParams.set('filters', params.filters);
  setBoolParam('filtration', params.filtration);
  setBoolParam('pagination', params.pagination);
  if (typeof params.page === 'number') url.searchParams.set('page', String(params.page));
  if (typeof params.limit === 'number') url.searchParams.set('limit', String(params.limit));

  console.log('[DEBUG] getRentPropertiesGrid - Final URL sent to backend:', url.toString());

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  console.log('[DEBUG] getRentPropertiesGrid - Response status:', response.status);

  if (!response.ok) {
    let message = `Error ${response.status} al obtener propiedades en renta`;
    try {
      const payload = await response.json();
      if (payload?.message) message = payload.message;
    } catch {}
    throw new Error(message);
  }

  const result = await response.json();
  console.log('[DEBUG] getRentPropertiesGrid - Response data length:', Array.isArray(result) ? result.length : 'Not an array');
  return result as RentPropertiesGridResponse;
}

export async function listAvailableRentProperties(
  params: ListAvailableRentPropertiesParams = {}
): Promise<AvailableRentProperty[]> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    throw new Error('No hay una sesión activa para consultar propiedades.');
  }

  const url = new URL(`${env.backendApiUrl}/properties/available-rent`);

  if (typeof params.search === 'string' && params.search.trim() !== '') {
    url.searchParams.set('search', params.search.trim());
  }

  if (typeof params.limit === 'number') {
    url.searchParams.set('limit', String(params.limit));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    let message = `Error ${response.status} al obtener propiedades disponibles para arriendo`;
    try {
      const payload = await response.json();
      if (payload?.message) {
        message = payload.message;
      }
    } catch {
      // ignore parse errors and keep default message
    }
    throw new Error(message);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Formato inesperado al listar propiedades disponibles para arriendo');
  }

  return data.map((item: any) => {
    const rawPrice = item?.price;
    const priceNumber =
      typeof rawPrice === 'number'
        ? rawPrice
        : rawPrice !== null && rawPrice !== undefined && !Number.isNaN(Number(rawPrice))
          ? Number(rawPrice)
          : undefined;

    return {
      id: item?.id,
      code: item?.code ?? null,
      title: item?.title ?? null,
      status: item?.status ?? null,
      city: item?.city ?? null,
      state: item?.state ?? null,
      price: priceNumber ?? null,
      currencyPrice: item?.currencyPrice ?? null,
      propertyTypeId: item?.propertyTypeId ?? null,
      propertyTypeName: item?.propertyTypeName ?? null,
      mainImageUrl: item?.mainImageUrl ?? null,
    } satisfies AvailableRentProperty;
  });
}

export async function getSalePropertiesCountSale(): Promise<number> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error('No hay sesión activa');
  const res = await fetch(`${env.backendApiUrl}/properties/count-sale`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Error al obtener el total de propiedades en venta');
  const data = await res.json();
  return data.total;
}

export async function getSalePropertiesCountPublished(): Promise<number> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error('No hay sesión activa');
  const res = await fetch(`${env.backendApiUrl}/properties/count-published`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Error al obtener el total de propiedades publicadas');
  const data = await res.json();
  return data.total;
}

export async function getSalePropertiesCountFeatured(): Promise<number> {
  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;
  if (!accessToken) throw new Error('No hay sesión activa');
  const res = await fetch(`${env.backendApiUrl}/properties/count-featured`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Error al obtener el total de propiedades destacadas');
  const data = await res.json();
  return data.total;
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

export type CreatePropertyPayload = FormData | { data: any; multimediaFiles?: File[] };

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

export async function publishPropertyPublic(
  payload: PublishPropertyPayload,
): Promise<{ success: boolean; data?: any; error?: string }> {
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
): Promise<{ success: boolean; data?: any; error?: string }> {
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
 * Create a new property
 */
export async function createProperty(data: CreatePropertyPayload): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    // Helper to build FormData from payload
    const buildFormData = (payload: CreatePropertyPayload) => {
      if (payload instanceof FormData) return payload;
      const fd = new FormData();
      fd.append('data', JSON.stringify(payload.data));
      if (payload.multimediaFiles && payload.multimediaFiles.length > 0) {
        payload.multimediaFiles.forEach((file, i) => fd.append('multimediaFiles', file));
      }
      return fd;
    };

    const attemptRequest = async (accessTokenToUse?: string) => {
      const fd = buildFormData(data);
      const response = await fetch(`${env.backendApiUrl}/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessTokenToUse ?? session.accessToken}`,
          // Content-Type must NOT be set for FormData
        },
        body: fd,
      });
      return response;
    };

    // Resolve token to use: prefer session token (fresh) then fallback to cookie
    let tokenToTry = session.accessToken;
    let tokenFromCookie: string | undefined;
    try {
      const cookieStore = await cookies();
      tokenFromCookie = cookieStore.get('access_token')?.value;
      if (!tokenToTry && tokenFromCookie) {
        tokenToTry = tokenFromCookie;
      }
    } catch (err) {
      console.warn('[createProperty] Could not read access_token cookie:', err);
    }

    // Debug: log which token source we're using (masked)
    try {
      const masked = tokenToTry ? `${String(tokenToTry).substring(0, 8)}...${String(tokenToTry).slice(-8)}` : 'none';
      console.log('[createProperty] Using token from', tokenToTry === tokenFromCookie ? 'cookie' : 'session', masked);
    } catch (err) {
      // ignore masking errors
    }

    // First attempt with resolved token
    let response = await attemptRequest(tokenToTry);

    // If unauthorized, try refresh and retry once
    if (response.status === 401) {
      console.log('[createProperty] Received 401, attempting token refresh');
      const refresh = await refreshAccessToken();
      if (refresh.success && refresh.data?.access_token) {
        console.log('[createProperty] Token refreshed, retrying request');
        response = await attemptRequest(refresh.data.access_token);
      } else {
        console.log('[createProperty] Token refresh failed, logging out');
        try {
          await logoutAction();
        } catch (err) {
          console.warn('[createProperty] Logout failed after refresh failure', err);
        }
        return { success: false, error: 'Sesión inválida. Por favor, inicia sesión nuevamente.' };
      }
    }

    // If still unauthorized, log response body for debugging
    if (response.status === 401) {
      const errBody = await response.json().catch(() => null);
      console.error('[createProperty] Still 401 after refresh. Response payload:', errBody);
    }

    // Extra fallback: if after refresh we still get 401, try one last time with the original session token
    if (response.status === 401 && session?.accessToken) {
      try {
        console.log('[createProperty] Retrying once with session token as a last-resort fallback');
        response = await attemptRequest(session.accessToken);
        if (response.status === 401) {
          const errBody = await response.json().catch(() => null);
          console.error('[createProperty] Final attempt with session token still 401. Payload:', errBody);
        } else {
          console.log('[createProperty] Final attempt with session token succeeded');
        }
      } catch (err) {
        console.warn('[createProperty] Final fallback attempt failed', err);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to create property: ${response.status}`,
      };
    }

    const result = await response.json();
    
    // Revalidate both sales and rent property paths
    revalidatePath('/backOffice/properties/sales');
    revalidatePath('/backOffice/properties/rent');
    revalidateTag('properties-grid');
    
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating property:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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
 * Get full property details with all relations and aggregated data
 */
export async function getFullProperty(id: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    console.log('🔍 [getFullProperty] Llamando a /properties/' + id + '/full');

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/full`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('❌ [getFullProperty] Error response:', {
        status: response.status,
        error: errorData
      });
      return { 
        success: false, 
        error: errorData?.message || `Failed to fetch full property: ${response.status}` 
      };
    }

    const result = await response.json();
    console.log('✅ [getFullProperty] Resultado completo:', {
      id: result?.id,
      title: result?.title,
      hasMultimedia: result?.multimedia ? result.multimedia.length : 0,
      hasPropertyType: !!result?.propertyType,
      propertyType: result?.propertyType,
      hasChangeHistory: !!result?.changeHistory,
      changeHistoryCount: result?.changeHistory?.length || 0
    });
    
    // Resolver nombres de usuarios del historial en el servidor
    if (result.changeHistory && Array.isArray(result.changeHistory) && result.changeHistory.length > 0) {
      console.log('📜 [getFullProperty] Resolviendo nombres de usuarios del historial...');
      
      // Obtener IDs únicos de usuarios
      const uniqueUserIds = [...new Set(
        result.changeHistory
          .map((h: any) => h.changedBy)
          .filter((id: any) => id && typeof id === 'string' && id !== 'system')
      )] as string[];
      
      console.log('👥 [getFullProperty] IDs de usuarios a resolver:', uniqueUserIds);
      
      // Cargar nombres de usuarios en paralelo
      const userPromises = uniqueUserIds.map(async (userId: string) => {
        try {
          const userResponse = await fetch(`${env.backendApiUrl}/users/${userId}`, {
            headers: {
              'Authorization': `Bearer ${session.accessToken}`,
            },
            cache: 'no-store',
          });
          
          if (!userResponse.ok) {
            console.warn(`⚠️ [getFullProperty] No se pudo cargar usuario ${userId}`);
            return { id: userId, name: 'Usuario desconocido' };
          }
          
          const user = await userResponse.json();
          const name = `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim() 
            || user.username 
            || 'Usuario desconocido';
          
          return { id: userId, name };
        } catch (error) {
          console.error(`❌ [getFullProperty] Error cargando usuario ${userId}:`, error);
          return { id: userId, name: 'Usuario desconocido' };
        }
      });
      
      const users = await Promise.all(userPromises);
      const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));
      
      console.log('✅ [getFullProperty] Nombres de usuarios resueltos:', userMap);
      
      // Agregar nombres al historial
      result.changeHistory = result.changeHistory.map((change: any) => ({
        ...change,
        changedByName: change.changedBy === 'system' 
          ? 'Sistema' 
          : (userMap[change.changedBy] || 'Usuario desconocido')
      }));
      
      console.log('✅ [getFullProperty] Historial enriquecido con nombres de usuarios');
    }
    
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ [getFullProperty] Error fetching full property:', error);
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
 * Update basic property information (title, description, status, operationType, propertyTypeId, assignedAgentId)
 */
export async function updatePropertyBasic(id: string, data: UpdatePropertyBasicDto): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/basic`, {
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
        error: errorData?.message || `Failed to update property basic info: ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating property basic info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
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

/**
 * Toggle property published status
 */
export async function togglePropertyPublished(id: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/toggle-published`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to toggle published status: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error toggling published status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Toggle property featured status
 */
export async function togglePropertyFeatured(id: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/toggle-featured`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to toggle featured status: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Assign agent to property
 */
export async function assignPropertyAgent(id: string, agentId: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/assign-agent`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Failed to assign agent: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error assigning agent:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get properties by agent
 */
export async function getPropertiesByAgent(agentId: string, params: {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'SOLD' | 'RESERVED';
} = {}): Promise<{
  success: boolean;
  data?: {
    data: Property[];
    total: number;
    page: number;
    limit: number;
  };
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.status) searchParams.set('status', params.status);

    const url = `${env.backendApiUrl}/properties/by-agent/${agentId}?${searchParams.toString()}`;
    
    const response = await fetch(url, {
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
        error: errorData?.message || `Failed to fetch properties by agent: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching properties by agent:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
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

/**
 * Update property characteristics
 */
export async function updatePropertyCharacteristics(id: string, data: UpdatePropertyCharacteristicsDto): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/characteristics`, {
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
        error: errorData?.message || `Failed to update property characteristics: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating property characteristics:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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

/**
 * Update property price and SEO information
 */
export async function updatePropertyPrice(id: string, data: UpdatePropertyPriceDto): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/price`, {
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
        error: errorData?.message || `Failed to update property price: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating property price:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update property location
 */
export async function updatePropertyLocation(id: string, data: UpdatePropertyLocationDto): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${id}/location`, {
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
        error: errorData?.message || `Failed to update property location: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating property location:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
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
}

/**
 * Public: list all published properties (no token required)
 */
export async function getPublishedPropertiesPublic(): Promise<{
  success: boolean;
  data?: PublicPropertyItem[];
  error?: string;
}> {
  try {
    const res = await fetch(`${env.backendApiUrl}/properties/public`, {
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
        error: errorData?.message || `Failed to fetch published properties: ${res.status}`,
      };
    }

  const payload = await res.json();
  // Controller returns { success: true, data: [...] }
  const data = Array.isArray(payload) ? payload : payload?.data ?? [];
  return { success: true, data };
  } catch (error) {
    console.error('Error fetching published properties (public):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
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
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch featured properties: ${res.status}`,
      };
    }

  const payload = await res.json();
  const data = Array.isArray(payload) ? payload : payload?.data ?? [];
  return { success: true, data };
  } catch (error) {
    console.error('Error fetching published featured properties (public):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function updateMainImage(
  propertyId: string,
  mainImageUrl: string | null
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${propertyId}/main-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ mainImageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al actualizar imagen principal'
      };
    }

    const updatedProperty = await response.json();
    
    // Revalidate the property page to refresh data
    revalidatePath(`/backOffice/properties`);
    
    return { success: true, data: updatedProperty };
  } catch (error) {
    console.error('Error updating main image:', error);
    return {
      success: false,
      error: 'Error inesperado al actualizar imagen principal'
    };
  }
}

export async function uploadPropertyMultimedia(
  propertyId: string,
  files: File[]
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await fetch(`${env.backendApiUrl}/properties/${propertyId}/multimedia`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al subir multimedia'
      };
    }

    const uploadedFiles = await response.json();
    return { success: true, data: uploadedFiles };
  } catch (error) {
    console.error('Error uploading multimedia:', error);
    return {
      success: false,
      error: 'Error inesperado al subir multimedia'
    };
  }
}

/**
 * Check if a multimedia item is the main image of a property
 */
export async function isMultimediaMain(
  propertyId: string,
  multimediaId: string
): Promise<{
  success: boolean;
  isMain?: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/properties/${propertyId}/multimedia/${multimediaId}/is-main`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || 'Error al verificar si la multimedia es principal'
      };
    }

    const result = await response.json();
    return { success: true, isMain: result.isMain };
  } catch (error) {
    console.error('Error checking if multimedia is main:', error);
    return {
      success: false,
      error: 'Error inesperado al verificar multimedia principal'
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
 * Get basic property information by ID (title, price, type, creator user)
 */
export async function getBasicPropertyInfo(propertyId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/basic`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch basic property info: ${res.status}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching basic property info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get property header information by ID (title, status)
 */
export async function getPropertyHeaderInfo(propertyId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/header`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch property header info: ${res.status}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching property header info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update property status
 */
export async function updatePropertyStatus(
  propertyId: string,
  status: string
): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to update property status: ${res.status}`,
      };
    }

    const data = await res.json();
    revalidatePath('/backOffice/properties');
    return { success: true, data };
  } catch (error) {
    console.error('Error updating property status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get property characteristics based on property type
 */
export async function getPropertyCharacteristics(propertyId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/characteristics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch property characteristics: ${res.status}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching property characteristics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get property location information
 */
export async function getPropertyLocation(propertyId: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    // Use the /full endpoint which includes location data
    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/full`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('❌ [getPropertyLocation] Failed to fetch:', {
        status: res.status,
        error: errorData?.message,
        url: `${env.backendApiUrl}/properties/${propertyId}/full`,
      });
      return {
        success: false,
        error: errorData?.message || `Failed to fetch property location: ${res.status}`,
      };
    }

    const fullData = await res.json();
    console.log('📍 [getPropertyLocation] Full property data received:', {
      propertyId,
      state: fullData?.state,
      city: fullData?.city,
      address: fullData?.address,
      latitude: fullData?.latitude,
      longitude: fullData?.longitude,
      allKeys: Object.keys(fullData || {}),
    });
    
    // Extract location data from the full property response
    const locationData = {
      state: fullData?.state || '',
      city: fullData?.city || '',
      address: fullData?.address || '',
      latitude: fullData?.latitude,
      longitude: fullData?.longitude,
    };
    
    console.log('✅ [getPropertyLocation] Location data extracted:', locationData);
    return { success: true, data: locationData };
  } catch (error) {
    console.error('❌ [getPropertyLocation] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get property multimedia
 */
export async function getPropertyMultimedia(propertyId: string): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/multimedia`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to fetch property multimedia: ${res.status}`,
      };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching property multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete property multimedia
 */
export async function deletePropertyMultimedia(
  propertyId: string,
  multimediaId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/multimedia/${multimediaId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to delete multimedia: ${res.status}`,
      };
    }

    // No revalidate path to keep dialog open
    return { success: true };
  } catch (error) {
    console.error('Error deleting multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update main multimedia URL
 */
export async function updateMainMultimediaUrl(
  propertyId: string,
  mainImageUrl: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/main-image`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ mainImageUrl }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to update main multimedia: ${res.status}`,
      };
    }

    // No revalidate path to keep dialog open
    return { success: true };
  } catch (error) {
    console.error('Error updating main multimedia URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get property history (requires auth)
 */
export async function getPropertyHistory(propertyId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;
    if (!accessToken) return { success: false, error: 'No authenticated' };

    const res = await fetch(`${env.backendApiUrl}/properties/${propertyId}/history`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    const payload = await res.json();
    return { success: true, data: payload?.data ?? payload };
  } catch (error) {
    console.error('[getPropertyHistory] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Resolve display names for history entries by user/person identifiers.
 * Tries /users/:id first, then /people/:id as fallback.
 */
export async function resolveHistoryUserDisplayNames(
  ids: string[],
): Promise<{ success: boolean; data?: Record<string, string>; error?: string }> {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = session?.accessToken;

    if (!accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const uniqueIds = Array.from(
      new Set(
        ids
          .filter((id): id is string => typeof id === 'string')
          .map((id) => id.trim())
          .filter((id) => id.length > 0 && id !== 'system'),
      ),
    );

    if (uniqueIds.length === 0) {
      return { success: true, data: {} };
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    };

    const resolveUserName = (payload: any): string | null => {
      const firstName = typeof payload?.personalInfo?.firstName === 'string' ? payload.personalInfo.firstName.trim() : '';
      const lastName = typeof payload?.personalInfo?.lastName === 'string' ? payload.personalInfo.lastName.trim() : '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || payload?.name || payload?.username || payload?.email || null;
    };

    const resolvePersonName = (payload: any): string | null => {
      const personName = typeof payload?.name === 'string' ? payload.name.trim() : '';
      if (personName) return personName;
      const userName = resolveUserName(payload?.user);
      if (userName) return userName;
      return typeof payload?.email === 'string' ? payload.email : null;
    };

    const entries = await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const userRes = await fetch(`${env.backendApiUrl}/users/${id}`, {
            method: 'GET',
            headers,
            cache: 'no-store',
          });

          if (userRes.ok) {
            const userPayload = await userRes.json().catch(() => null);
            const displayName = resolveUserName(userPayload);
            if (displayName) {
              return [id, displayName] as const;
            }
          }

          const personRes = await fetch(`${env.backendApiUrl}/people/${id}`, {
            method: 'GET',
            headers,
            cache: 'no-store',
          });

          if (personRes.ok) {
            const personPayload = await personRes.json().catch(() => null);
            const displayName = resolvePersonName(personPayload);
            if (displayName) {
              return [id, displayName] as const;
            }
          }
        } catch {
          // ignore and continue with next id
        }

        return [id, ''] as const;
      }),
    );

    const data: Record<string, string> = {};
    for (const [id, name] of entries) {
      if (name) {
        data[id] = name;
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error('[resolveHistoryUserDisplayNames] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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
export async function getPublishedFeaturedProperties(page = 1): Promise<{ success: boolean; data?: any[]; pagination?: any; error?: string }> {
  try {
    const res = await fetch(`${env.backendApiUrl}/properties/public/featured/paginated?page=${page}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      return { success: false, error: err?.message || `HTTP ${res.status}` };
    }

    const payload = await res.json();
    const ensureAbsoluteUrl = (url?: string | null): string | null => {
      if (!url) return null;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      if (url.startsWith('/')) return `${env.backendApiUrl}${url}`;
      return url;
    };

    const rawData = payload?.data ?? payload ?? [];
    const normalizedData = (Array.isArray(rawData) ? rawData : []).map((property: any) => ({
      ...property,
      mainImageUrl: ensureAbsoluteUrl(property?.mainImageUrl),
      multimedia: (property?.multimedia || []).map((m: any) => ({
        ...m,
        url: ensureAbsoluteUrl(m?.url),
        variants: (m?.variants || []).map((v: any) => ({
          ...v,
          url: ensureAbsoluteUrl(v?.url),
        })),
      })),
    }));

    return { success: true, data: normalizedData, pagination: payload?.pagination };
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


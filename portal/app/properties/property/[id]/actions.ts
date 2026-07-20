'use server';

'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

// Define Property type locally to avoid importing auth dependencies

// Define Property type locally to avoid importing auth dependencies
export interface Property {
  id: string;
  title: string;
  description?: string;
  price: number;
  currencyPrice: 'CLP' | 'UF';
  status: string;
  operationType: 'RENT' | 'SALE';
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  propertyType?: {
    id: string;
    name: string;
  };
  assignedAgent?: {
    id: string;
    username?: string;
    email?: string;
    personalInfo?: {
      firstName?: string;
      lastName?: string;
    };
  };
  // Location fields - exactly as backend returns them
  state?: string; // RegionEnum
  city?: string; // ComunaEnum
  address?: string;
  latitude?: number;
  longitude?: number;
  // Multimedia array
  multimedia?: Array<{
    id: string;
    url: string;
    type: string;
  }>;
  mainImageUrl?: string;
  // Additional data
  builtSquareMeters?: number;
  landSquareMeters?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  floors?: number;
  publishedAt?: string;
  // Favorites
  favorites?: Array<{ userId: string; addedAt: string }>;
  favoritesCount?: number;
}

/**
 * Public: Get a single property by ID (accessible from portal)
 * No authentication required - returns any property that exists
 */
export async function getPublishedPropertyPublic(id: string): Promise<{
  success: boolean;
  data?: Property;
  error?: string;
}> {
  try {
    // Try to fetch the full property details without authentication
    const res = await fetch(`${env.backendApiUrl}/properties/${id}/full`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      // Solo loguear si hay un error relevante
      if (errorData?.message && res.status !== 404) {
        console.error('Error fetching property:', {
          status: res.status,
          error: errorData,
          id
        });
      }
      return {
        success: false,
        error: 'Propiedad no encontrada',
      };
    }

    const data = await res.json();
    
    // Log what we received for debugging
    console.log('Property fetched from /full endpoint:', {
      id: data?.id,
      title: data?.title,
      status: data?.status,
      state: data?.state,
      city: data?.city,
      address: data?.address,
      latitude: data?.latitude,
      longitude: data?.longitude,
      multimedia: data?.multimedia?.length || 0,
    });

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
 * Notify property interest - sends notification to admins and assigned agent
 * Server action that handles authentication
 */
export async function notifyPropertyInterest(data: {
  propertyId: string;
  assignedAgentId?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current session to determine if user is logged in
    const session = await getServerSession(authOptions);
    const currentUser = session?.user;

    // Use public endpoint that doesn't require authentication
    const url = `${env.backendApiUrl}/notifications/public/property-interest`;
    
    const body = {
      propertyId: data.propertyId,
      assignedAgentId: data.assignedAgentId,
      interestedUserId: currentUser?.id, // Will be undefined if not logged in
      interestedUserName: data.name,
      interestedUserEmail: data.email,
      interestedUserPhone: data.phone,
      interestedUserMessage: data.message,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { success: false, error: errorData?.message || `HTTP ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get related properties based on similarity algorithm
 * Public endpoint - no authentication required
 */
export async function getRelatedProperties(
  propertyId: string,
  limit: number = 5
): Promise<{ success: boolean; data?: Property[]; error?: string }> {
  try {
    const url = `${env.backendApiUrl}/properties/related/${propertyId}?limit=${limit}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `HTTP ${response.status}` 
      };
    }

    const properties = await response.json();
    return { success: true, data: properties || [] };
  } catch (error) {
    console.error('Error fetching related properties:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

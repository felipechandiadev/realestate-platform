'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { redirect } from 'next/navigation';

export interface PropertySEOData {
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  slug?: string;
  isFeatured?: boolean;
  publicationDate?: string;
  viewsCount?: number;
  favoritesCount?: number;
}

/**
 * Obtiene los datos SEO de una propiedad
 */
export async function getPropertySEO(propertyId: string): Promise<{
  success: boolean;
  data?: PropertySEOData;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(
      `${env.backendApiUrl}/properties/${propertyId}/seo`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Si es 401, redirigir a inicio
    if (response.status === 401) {
      redirect('/');
    }

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
    console.error('Error fetching property SEO:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Actualiza los datos SEO de una propiedad
 */
export async function updatePropertySEO(
  propertyId: string,
  seoData: PropertySEOData
): Promise<{
  success: boolean;
  data?: PropertySEOData;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    // Validar que el slug sea único (en formato correcto)
    if (seoData.slug) {
      // Convertir a minúsculas y reemplazar espacios con guiones
      seoData.slug = seoData.slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }

    // Limitar descripción SEO a 160 caracteres
    if (seoData.seoDescription && seoData.seoDescription.length > 160) {
      seoData.seoDescription = seoData.seoDescription.substring(0, 160);
    }

    // Limitar título SEO a 60 caracteres
    if (seoData.seoTitle && seoData.seoTitle.length > 60) {
      seoData.seoTitle = seoData.seoTitle.substring(0, 60);
    }

    const response = await fetch(
      `${env.backendApiUrl}/properties/${propertyId}/seo`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoData),
      }
    );

    // Si es 401, redirigir a inicio
    if (response.status === 401) {
      redirect('/');
    }

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
    console.error('Error updating property SEO:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

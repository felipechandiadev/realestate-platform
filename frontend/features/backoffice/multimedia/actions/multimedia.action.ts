'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';
import { uploadMultipleDocuments, type Document } from './documents';

// ===================================
// Multimedia Types and Interfaces
// ===================================

export interface MultimediaItem {
  id: string;
  propertyId: string;
  url: string;
  // Original canonical types used by earlier code paths
  type: 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR';
  // Backend extended types (optional)
  format?: 'IMG' | 'VIDEO' | 'VIRTUAL_TOUR';
  // Sometimes backend sends PROPERTY_IMG / PROPERTY_VIDEO through other endpoints; keep loose alias propertyType
  propertyType?: 'PROPERTY_IMG' | 'PROPERTY_VIDEO';
  mimeType?: string;
  filename?: string; // Some legacy endpoints supply filename
  originalName?: string;
  size?: number;      // Legacy size
  fileSize?: number;  // New size field
  isMain?: boolean;
  order?: number;
  description?: string;
  seoTitle?: string;
  userId?: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number; // For videos
    alt?: string;
    caption?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface UploadMultimediaRequest {
  propertyId: string;
  files: File[];
  type?: 'IMAGE' | 'VIDEO';
  descriptions?: string[];
}

export interface UpdateMultimediaOrderRequest {
  propertyId: string;
  items: Array<{
    id: string;
    order: number;
  }>;
}

export interface SetMainMultimediaRequest {
  propertyId: string;
  multimediaId: string;
}

// ===================================
// Multimedia Server Actions
// ===================================

/**
 * Upload multimedia files for a property
 */
export async function uploadPropertyMultimedia(
  propertyId: string,
  files: File[],
  type: 'IMAGE' | 'VIDEO' = 'IMAGE'
): Promise<{
  success: boolean;
  data?: MultimediaItem[];
  errors?: Array<{ file: string; error: string }>;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    // Determine document type based on multimedia type
    const docType = type === 'VIDEO' ? 'PROPERTY_VIDEO' : 'PROPERTY_IMG';

    // Upload files using documents service
    const uploadResult = await uploadMultipleDocuments(files, {
      propertyId,
      type: docType,
      category: 'multimedia'
    });

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error,
        errors: uploadResult.errors
      };
    }

    // Transform documents to multimedia items
    const multimediaItems: MultimediaItem[] = uploadResult.data?.map((doc: Document, index: number) => ({
      id: doc.id,
      propertyId,
      url: doc.url,
      type: type,
      format: type === 'VIDEO' ? 'VIDEO' : 'IMG', // Agregar format basado en type
      mimeType: doc.mimeType,
      filename: doc.filename,
      originalName: doc.originalName,
      size: doc.size,
      isMain: index === 0, // First image is main by default
      order: index,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })) || [];

    return {
      success: true,
      data: multimediaItems,
      errors: uploadResult.errors
    };
  } catch (error) {
    console.error('Error uploading property multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get all multimedia for a property
 */
export async function getPropertyMultimedia(propertyId: string): Promise<{
  success: boolean;
  data?: MultimediaItem[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/multimedia/property/${propertyId}`, {
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
        error: errorData?.message || `Failed to fetch multimedia: ${response.status}`
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching property multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get a specific multimedia item by ID
 */
export async function getMultimedia(multimediaId: string): Promise<{
  success: boolean;
  data?: MultimediaItem;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autorizado' };
    }

    const response = await fetch(`${env.backendApiUrl}/multimedia/${multimediaId}`, {
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
        error: errorData?.message || `Error al obtener multimedia: ${response.status}`
      };
    }

    const multimedia = await response.json();
    return { success: true, data: multimedia };
  } catch (error) {
    console.error('Error getting multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
/**
 * Delete a multimedia item (hard delete - removes file and record)
 */
export async function deleteMultimedia(multimediaId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/multimedia/${multimediaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to delete multimedia: ${response.status}`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update multimedia order for a property
 */
export async function updateMultimediaOrder(
  propertyId: string,
  items: Array<{ id: string; order: number }>
): Promise<{
  success: boolean;
  data?: MultimediaItem[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/multimedia/property/${propertyId}/order`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to update order: ${response.status}`
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating multimedia order:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Set main multimedia item for a property
 */
export async function setMainMultimedia(
  propertyId: string,
  multimediaId: string
): Promise<{
  success: boolean;
  data?: MultimediaItem[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/multimedia/property/${propertyId}/main`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ multimediaId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to set main multimedia: ${response.status}`
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error setting main multimedia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update multimedia metadata (description, alt text, etc.)
 */
export async function updateMultimediaMetadata(
  id: string,
  metadata: {
    description?: string;
    alt?: string;
    caption?: string;
  }
): Promise<{
  success: boolean;
  data?: MultimediaItem;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/multimedia/${id}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Failed to update metadata: ${response.status}`
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating multimedia metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get multimedia statistics for a property
 */
export async function getPropertyMultimediaStats(propertyId: string): Promise<{
  success: boolean;
  data?: {
    totalImages: number;
    totalVideos: number;
    totalSize: number;
    hasMainImage: boolean;
  };
  error?: string;
}> {
  try {
    const multimediaResult = await getPropertyMultimedia(propertyId);
    
    if (!multimediaResult.success || !multimediaResult.data) {
      return {
        success: false,
        error: multimediaResult.error || 'No multimedia found'
      };
    }

    const items = multimediaResult.data;
    const stats = {
      totalImages: items.filter(item => item.type === 'IMAGE').length,
      totalVideos: items.filter(item => item.type === 'VIDEO').length,
      totalSize: items.reduce((total, item) => total + (item.size ?? item.fileSize ?? 0), 0),
      hasMainImage: items.some(item => item.isMain && item.type === 'IMAGE'),
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting multimedia stats:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { env } from '@/lib/env';

// ===================================
// Document Types and Interfaces
// ===================================

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  metadata?: {
    propertyId?: string;
    type?: 'PROPERTY_IMG' | 'PROPERTY_VIDEO' | 'DOCUMENT' | 'OTHER';
    category?: string;
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Document Entity from Backend
export interface DocumentEntity {
  id: string;
  title: string;
  documentTypeId: string;
  documentType?: {
    id: string;
    name: string;
    description?: string;
  };
  multimediaId?: string;
  multimedia?: {
    id: string;
    url: string;
    filename: string;
    type: string;
  };
  uploadedById: string;
  uploadedBy?: {
    id: string;
    email: string;
    name?: string;
  };
  personId?: string;
  person?: {
    id: string;
    name?: string;
    dni?: string;
  };
  contractId?: string;
  contract?: {
    id: string;
    code?: string;
    operation?: 'COMPRAVENTA' | 'ARRIENDO' | string;
  };
  paymentId?: string;
  status: 'PENDING' | 'UPLOADED' | 'RECIBIDO' | 'REJECTED';
  notes?: string;
  required?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateDocumentData {
  title: string;
  documentTypeId: string;
  uploadedById: string;
  personId?: string;
  contractId?: string;
  paymentId?: string;
  status?: 'PENDING' | 'UPLOADED' | 'RECIBIDO' | 'REJECTED';
  notes?: string;
  required?: boolean;
}

export interface UploadDocumentWithFileData {
  title: string;
  documentTypeId: string;
  uploadedById: string;
  personId?: string;
  status?: 'PENDING' | 'UPLOADED' | 'RECIBIDO' | 'REJECTED';
  notes?: string;
  seoTitle?: string;
  required?: boolean;
  multimediaType?: 'DNI_FRONT' | 'DNI_REAR' | 'DOCUMENT';
}

export interface UploadDocumentMetadata {
  propertyId?: string;
  type?: 'PROPERTY_IMG' | 'PROPERTY_VIDEO' | 'DOCUMENT' | 'OTHER';
  category?: string;
  description?: string;
}

export interface DocumentListParams {
  propertyId?: string;
  type?: 'PROPERTY_IMG' | 'PROPERTY_VIDEO' | 'DOCUMENT' | 'OTHER';
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
}

// ===================================
// Document Server Actions
// ===================================

/**
 * Upload a single document/file
 */
export async function uploadDocument(
  file: File, 
  metadata?: UploadDocumentMetadata
): Promise<{
  success: boolean;
  data?: Document;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    const response = await fetch(`${env.backendApiUrl}/document/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Upload failed: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error uploading document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Upload multiple documents/files
 */
export async function uploadMultipleDocuments(
  files: File[], 
  metadata?: UploadDocumentMetadata
): Promise<{
  success: boolean;
  data?: Document[];
  errors?: Array<{ file: string; error: string }>;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const results: Document[] = [];
    const errors: Array<{ file: string; error: string }> = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      if (metadata) {
        formData.append('metadata', JSON.stringify(metadata));
      }

      try {
        const response = await fetch(`${env.backendApiUrl}/document/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          results.push(result);
        } else {
          const errorData = await response.json().catch(() => null);
          errors.push({ 
            file: file.name, 
            error: errorData?.message || `Upload failed: ${response.status}` 
          });
        }
      } catch (fileError) {
        errors.push({ 
          file: file.name, 
          error: fileError instanceof Error ? fileError.message : 'Unknown error' 
        });
      }
    }

    return { 
      success: results.length > 0, 
      data: results.length > 0 ? results : undefined,
      errors: errors.length > 0 ? errors : undefined,
      error: errors.length === files.length ? 'All uploads failed' : undefined
    };
  } catch (error) {
    console.error('Error uploading multiple documents:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get a document by ID
 */
export async function getDocument(id: string): Promise<{
  success: boolean;
  data?: Document;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/document/${id}`, {
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
        error: errorData?.message || `Failed to fetch document: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * List documents with filters
 */
export async function listDocuments(params: DocumentListParams = {}): Promise<{
  success: boolean;
  data?: {
    data: Document[];
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
    if (params.propertyId) searchParams.set('propertyId', params.propertyId);
    if (params.type) searchParams.set('type', params.type);
    if (params.category) searchParams.set('category', params.category);
    if (params.search) searchParams.set('search', params.search);
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());

    const url = `${env.backendApiUrl}/document?${searchParams.toString()}`;
    
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
        error: errorData?.message || `Failed to list documents: ${response.status}` 
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error listing documents:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Delete a document (from old interface)
 */
export async function deleteDocumentOld(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/document/${id}`, {
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
        error: errorData?.message || `Failed to delete document: ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Update document metadata
 */
export async function updateDocumentMetadata(
  id: string, 
  metadata: UploadDocumentMetadata
): Promise<{
  success: boolean;
  data?: Document;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' };
    }

    const response = await fetch(`${env.backendApiUrl}/document/${id}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
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
    console.error('Error updating document metadata:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get documents by property ID (specific to property multimedia)
 */
export async function getPropertyDocuments(propertyId: string): Promise<{
  success: boolean;
  data?: Document[];
  error?: string;
}> {
  try {
    const result = await listDocuments({ 
      propertyId,
      limit: 100 
    });
    
    if (result.success && result.data) {
      return { success: true, data: result.data.data };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Error fetching property documents:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// ===================================
// Document Entity Actions (Backend)
// ===================================

/**
 * Create a document record (without file upload)
 */
export async function createDocument(
  data: CreateDocumentData
): Promise<{
  success: boolean;
  data?: DocumentEntity;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${env.backendApiUrl}/document`, {
      method: 'POST',
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
        error: errorData?.message || `Error al crear documento: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error creating document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Upload a document with file
 */
export async function uploadDocumentWithFile(
  file: File,
  data: UploadDocumentWithFileData
): Promise<{
  success: boolean;
  data?: DocumentEntity;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', data.title);
    formData.append('documentTypeId', data.documentTypeId);
    formData.append('uploadedById', data.uploadedById);
    
    if (data.personId) {
      formData.append('personId', data.personId);
    }
    if (data.status) {
      formData.append('status', data.status);
    }
    if (data.notes) {
      formData.append('notes', data.notes);
    }
    if (data.seoTitle) {
      formData.append('seoTitle', data.seoTitle);
    }
    if (typeof data.required === 'boolean') {
      formData.append('required', data.required ? 'true' : 'false');
    }

    const response = await fetch(`${env.backendApiUrl}/document/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Error al subir documento: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error uploading document with file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Get documents by person ID
 */
export async function getPersonDocuments(
  personId: string
): Promise<{
  success: boolean;
  data?: DocumentEntity[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${env.backendApiUrl}/document?personId=${personId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Error al obtener documentos: ${response.status}` 
      };
    }

    const result = await response.json();
    // Filter by personId on client side since backend returns all documents
    const filtered = Array.isArray(result) 
      ? result.filter((doc: DocumentEntity) => doc.personId === personId)
      : [];
    
    return { success: true, data: filtered };
  } catch (error) {
    console.error('Error fetching person documents:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Get documents by contract ID
 */
export async function getContractDocuments(
  contractId: string
): Promise<{
  success: boolean;
  data?: DocumentEntity[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${env.backendApiUrl}/document?contractId=${contractId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error al obtener documentos: ${response.status}`,
      };
    }

    const result = await response.json();
    const items = Array.isArray(result)
      ? result
      : Array.isArray(result?.data)
      ? result.data
      : [];

    const filtered = items.filter((doc: DocumentEntity) => {
      if (!doc) {
        return false;
      }
      if (typeof doc.contractId === 'string') {
        return doc.contractId === contractId;
      }
      const contract = doc.contract as { id?: string } | undefined;
      if (contract?.id) {
        return contract.id === contractId;
      }
      return false;
    });

    return { success: true, data: filtered };
  } catch (error) {
    console.error('Error fetching contract documents:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Update the required flag of a document
 */
export async function updateDocumentRequired(
  documentId: string,
  required: boolean,
): Promise<{
  success: boolean;
  data?: DocumentEntity;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${env.backendApiUrl}/document/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ required }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return {
        success: false,
        error: errorData?.message || `Error al actualizar requisito: ${response.status}`,
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating document required flag:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Update document status
 */
export async function updateDocumentStatus(
  documentId: string,
  status: 'PENDING' | 'UPLOADED' | 'RECIBIDO' | 'REJECTED'
): Promise<{
  success: boolean;
  data?: DocumentEntity;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${env.backendApiUrl}/document/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Error al actualizar estado: ${response.status}` 
      };
    }

    const result = await response.json();
    return { success: true, data: result };
  } catch (error) {
    console.error('Error updating document status:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(
  documentId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return { success: false, error: 'No autenticado' };
    }

    const response = await fetch(`${env.backendApiUrl}/document/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return { 
        success: false, 
        error: errorData?.message || `Error al eliminar documento: ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}
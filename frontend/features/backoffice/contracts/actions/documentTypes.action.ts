'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

export interface DocumentType {
  id: string
  name: string
  description?: string
  available: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateDocumentTypeDto {
  name: string
  description?: string
  available?: boolean
}

export interface UpdateDocumentTypeDto {
  name?: string
  description?: string
  available?: boolean
}

/**
 * Obtiene todos los tipos de documentos
 */
export async function getDocumentTypes(): Promise<DocumentType[]> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/document-types`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch document types: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching document types:', error)
    throw error
  }
}

/**
 * Obtiene un tipo de documento por ID
 */
export async function getDocumentType(id: string): Promise<DocumentType> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/document-types/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch document type: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching document type:', error)
    throw error
  }
}

/**
 * Crea un nuevo tipo de documento
 */
export async function createDocumentType(data: CreateDocumentTypeDto): Promise<{ success: boolean; data?: DocumentType; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return { success: false, error: 'No autenticado' }
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/document-types`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || `Error al crear tipo de documento: ${response.status}` 
      }
    }

    const documentType = await response.json()
    return { success: true, data: documentType }
  } catch (error) {
    console.error('Error creating document type:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al crear tipo de documento' 
    }
  }
}

/**
 * Actualiza un tipo de documento
 */
export async function updateDocumentType(id: string, data: UpdateDocumentTypeDto): Promise<{ success: boolean; data?: DocumentType; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return { success: false, error: 'No autenticado' }
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/document-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || `Error al actualizar tipo de documento: ${response.status}` 
      }
    }

    const documentType = await response.json()
    return { success: true, data: documentType }
  } catch (error) {
    console.error('Error updating document type:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al actualizar tipo de documento' 
    }
  }
}

/**
 * Elimina un tipo de documento (soft delete)
 */
export async function deleteDocumentType(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return { success: false, error: 'No autenticado' }
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/document-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || `Error al eliminar tipo de documento: ${response.status}` 
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting document type:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al eliminar tipo de documento' 
    }
  }
}

/**
 * Cambia el estado de disponibilidad de un tipo de documento
 */
export async function toggleDocumentTypeAvailability(id: string, available: boolean): Promise<{ success: boolean; data?: DocumentType; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return { success: false, error: 'No autenticado' }
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/document-types/${id}/available`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ available }),
      cache: 'no-store'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return { 
        success: false, 
        error: errorData.message || `Error al cambiar disponibilidad: ${response.status}` 
      }
    }

    const documentType = await response.json()
    return { success: true, data: documentType }
  } catch (error) {
    console.error('Error toggling document type availability:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al cambiar disponibilidad' 
    }
  }
}

'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

// Types
export interface Slide {
  id: string;
  title: string;
  description?: string;
  multimediaUrl?: string;
  linkUrl?: string;
  duration?: number;
  startDate?: string;
  endDate?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSlideDto {
  title: string;
  description?: string;
  linkUrl?: string;
  isActive?: boolean;
  order?: number;
}

export interface GetSlidesParams {
  search?: string;
}

export async function getSlides(params: GetSlidesParams = {}): Promise<{
  success: boolean;
  data?: Slide[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const url = new URL(`${env.backendApiUrl}/slide`)
    
    // Agregar parámetros de búsqueda
    if (params.search) {
      url.searchParams.set('search', params.search)
    }

    const res = await fetch(url.toString(), {
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `HTTP ${res.status}` 
      }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching slides:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getPublicSlides(): Promise<{
  success: boolean;
  data?: Slide[];
  error?: string;
}> {
  try {
    const res = await fetch(`${env.backendApiUrl}/slide/public/active`, {
      headers: { 
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `HTTP ${res.status}` 
      }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching public slides:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function createSlide(data: CreateSlideDto, image?: File): Promise<{
  success: boolean;
  data?: Slide;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    let body: any
    const headers: any = {
      'Authorization': `Bearer ${session.accessToken}`,
    }

    if (image) {
      // Si hay imagen, usar FormData
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
      
      formData.append('image', image)
      body = formData
    } else {
      // Si no hay imagen, usar JSON
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(data)
    }

    const res = await fetch(`${env.backendApiUrl}/slide`, {
      method: 'POST',
      headers,
      body,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `Failed to create slide: ${res.status}` 
      }
    }

    const result = await res.json()
    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating slide:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function createSlideWithMultimedia(data: FormData): Promise<{
  success: boolean;
  data?: Slide;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/slide/create-with-multimedia`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        // No incluir Content-Type para FormData - el browser lo maneja automáticamente
      },
      body: data,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      
      // Manejo específico para errores de tamaño de archivo
      if (errorData?.message?.includes('excede el límite')) {
        return { 
          success: false, 
          error: errorData.message // Mostrar mensaje específico del backend
        }
      }
      
      return { 
        success: false, 
        error: errorData?.message || `Failed to create slide with multimedia: ${res.status}` 
      }
    }

    const result = await res.json()
    
    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/slider')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating slide with multimedia:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function updateSlide(id: string, data: Partial<Slide>, image?: File): Promise<{
  success: boolean;
  data?: Slide;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    let body: any
    const headers: any = {
      'Authorization': `Bearer ${session.accessToken}`,
    }

    if (image) {
      // Si hay imagen, usar FormData
      const formData = new FormData()
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })
      
      formData.append('image', image)
      body = formData
    } else {
      // Si no hay imagen, usar JSON
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(data)
    }

    const res = await fetch(`${env.backendApiUrl}/slide/${id}`, {
      method: 'PATCH',
      headers,
      body,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `Failed to update slide: ${res.status}` 
      }
    }

    const result = await res.json()
    
    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/slider')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating slide:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function updateSlideWithMultimedia(id: string, data: FormData): Promise<{
  success: boolean;
  data?: Slide;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/slide/${id}/with-multimedia`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        // No incluir Content-Type para FormData - el browser lo maneja automáticamente
      },
      body: data,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      
      // Manejo específico para errores de tamaño de archivo
      if (errorData?.message?.includes('excede el límite')) {
        return { 
          success: false, 
          error: errorData.message // Mostrar mensaje específico del backend
        }
      }
      
      return { 
        success: false, 
        error: errorData?.message || `Failed to update slide with multimedia: ${res.status}` 
      }
    }

    const result = await res.json()
    
    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/slider')
    
    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating slide with multimedia:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function deleteSlide(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/slide/${id}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `Failed to delete slide: ${res.status}` 
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting slide:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function reorderSlides(slideIds: string[]): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/slide/reorder`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slideIds }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `Failed to reorder slides: ${res.status}` 
      }
    }

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/slider')
    
    return { success: true }
  } catch (error) {
    console.error('Error reordering slides:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function toggleSlideStatus(id: string): Promise<{
  success: boolean;
  data?: Slide;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/slide/${id}/toggle-status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return { 
        success: false, 
        error: errorData?.message || `Failed to toggle slide status: ${res.status}` 
      }
    }

    const result = await res.json()
    return { success: true, data: result }
  } catch (error) {
    console.error('Error toggling slide status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
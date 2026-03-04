'use server'

// Acción pública para portal
export async function listPublicTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch(`${env.backendApiUrl}/testimonials/public`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}




import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

// Types
export interface Testimonial {
  id: string;
  name: string;
  content: string;
  position?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestimonialDto {
  name: string;
  content: string;
  position?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface UpdateTestimonialDto {
  name?: string;
  content?: string;
  position?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface GetTestimonialsParams {
  search?: string;
}

export async function getTestimonials(params: GetTestimonialsParams = {}): Promise<{
  success: boolean;
  data?: Testimonial[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const url = new URL(`${env.backendApiUrl}/testimonials`)

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
    console.error('Error fetching testimonials:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function createTestimonial(formData: FormData): Promise<{
  success: boolean;
  data?: Testimonial;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/testimonials`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `Failed to create testimonial: ${res.status}`
      }
    }

    const result = await res.json()

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/testimonials')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating testimonial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function updateTestimonial(id: string, formData: FormData): Promise<{
  success: boolean;
  data?: Testimonial;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/testimonials/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `Failed to update testimonial: ${res.status}`
      }
    }

    const result = await res.json()

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/testimonials')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating testimonial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function deleteTestimonial(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/testimonials/${id}`, {
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
        error: errorData?.message || `Failed to delete testimonial: ${res.status}`
      }
    }

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/testimonials')

    return { success: true }
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
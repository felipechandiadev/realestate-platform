'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'
import { getUser, type BackendAdministrator } from '@/features/backoffice/users/actions/users.action'

export interface Person {
  id: string
  name?: string // Nombre completo (consistente con la entidad Person)
  email?: string
  phone?: string
  dni?: string
  address?: string
  city?: string
  state?: string
  country?: string
  birthDate?: string
  profilePicture?: string
  maritalStatus?: string
  gender?: string
  nationality?: string
  profession?: string
  company?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  verified?: boolean
  verificationRequest?: string
  dniCardFrontId?: string
  dniCardRearId?: string
  dniCardFront?: {
    id: string
    url: string
  }
  dniCardRear?: {
    id: string
    url: string
  }
  // Additional fields for users
  userRole?: string
  userStatus?: string
  isFromUser?: boolean
}

export interface CreatePersonDto {
  name?: string
  dni?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  verified?: boolean
  verificationRequest?: Date
  dniCardFrontId?: string
  dniCardRearId?: string
  userId?: string
  maritalStatus?: string
  gender?: string
  nationality?: string
  profession?: string
  company?: string
}

export interface UpdatePersonDto {
  name?: string
  dni?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  birthDate?: string
  profilePicture?: string
  // Nuevos campos para coincidir con el backend
  nationality?: string
  gender?: string
  maritalStatus?: string
  profession?: string
  company?: string
  dniCardFrontId?: string
  dniCardRearId?: string
  userId?: string
}

export interface ListPersonsParams {
  search?: string
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
  sortField?: string
  city?: string
  state?: string
  country?: string
}

/**
 * Lista todas las personas con filtros y paginación
 */
export async function listPersons(params?: ListPersonsParams): Promise<Person[]> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const url = new URL(`${env.backendApiUrl}/people/all`)
    
    if (params?.search) url.searchParams.set('search', params.search)
    if (params?.page) url.searchParams.set('page', params.page.toString())
    if (params?.limit) url.searchParams.set('limit', params.limit.toString())
    if (params?.sort) url.searchParams.set('sort', params.sort)
    if (params?.sortField) url.searchParams.set('sortField', params.sortField)
    if (params?.city) url.searchParams.set('city', params.city)
    if (params?.state) url.searchParams.set('state', params.state)
    if (params?.country) url.searchParams.set('country', params.country)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch persons statistics: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching persons statistics:', error)
    throw error
  }
}

/**
 * Busca personas para AutoComplete (solo id, nombre y RUT)
 */
export async function searchPersons(): Promise<Array<{ id: string; name: string; dni: string }>> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/search`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to search persons: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error searching persons:', error)
    throw error
  }
}

/**
 * Sube un documento de identificación (DNI) y lo asocia a una persona
 */
export async function uploadDniDocument(
  personId: string,
  file: File,
  documentType: 'front' | 'rear'
): Promise<{ success: boolean; multimediaId?: string; url?: string; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return { success: false, error: 'No autenticado' }
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('dniSide', documentType === 'front' ? 'FRONT' : 'REAR')
    formData.append('personId', personId)

    const uploadResponse = await fetch(`${env.backendApiUrl}/document/upload-dni`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      return { success: false, error: errorData.message || 'Error al subir el archivo' }
    }

    const documentData = await uploadResponse.json()
    const multimediaId: string | undefined = documentData?.multimedia?.id ?? documentData?.multimediaId
    const url: string | undefined = documentData?.multimedia?.url ?? undefined

    if (!multimediaId) {
      return { success: false, error: 'No se pudo obtener el identificador del archivo subido' }
    }

    // Revalidate the person detail page to reflect the changes
    revalidatePath(`/backOffice/contracts/persons/${personId}`)

    return { success: true, multimediaId, url }
  } catch (error) {
    console.error('Error uploading DNI document:', error)
    return { success: false, error: 'Error al procesar el documento' }
  }
}

/**
 * Obtiene la URL de un documento multimedia
 */
export async function getMultimediaUrl(multimediaId: string): Promise<string | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return null
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/multimedia/${multimediaId}/url`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.url || null
  } catch (error) {
    console.error('Error fetching multimedia URL:', error)
    return null
  }
}

/**
 * Verificar una persona (admin)
 */
export async function verifyPerson(id: string): Promise<Person> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/${id}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Failed to verify person: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error verifying person:', error)
    throw error
  }
}

/**
 * Desverificar una persona (admin)
 */
export async function unverifyPerson(id: string): Promise<Person> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/${id}/unverify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Failed to unverify person: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error unverifying person:', error)
    throw error
  }
}

/**
 * Solicitar verificación (usuario)
 */
export async function requestVerification(id: string): Promise<Person> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/${id}/request-verification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Failed to request verification: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error requesting verification:', error)
    throw error
  }
}

/**
 * Obtiene una persona por ID
 */
export async function getPerson(id: string): Promise<Person> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (response.status === 404) {
      const fallback = await getUserAsPerson(id)
      if (fallback) {
        return fallback
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch person: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching person:', error)
    throw error
  }
}

type UserLike = BackendAdministrator & {
  createdAt?: string
  updatedAt?: string
  role?: string
}

async function getUserAsPerson(id: string): Promise<Person | null> {
  const result = await getUser(id)
  if (!result.success || !result.data) {
    return null
  }

  const user = result.data as UserLike
  const nowIso = new Date().toISOString()
  const firstName = user.personalInfo?.firstName?.trim() ?? ''
  const lastName = user.personalInfo?.lastName?.trim() ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    id: user.id,
    name: fullName || user.username || user.email || 'Usuario del sistema',
    email: user.email,
    phone: user.personalInfo?.phone ?? undefined,
    address: user.personalInfo?.address ?? undefined,
    city: user.personalInfo?.city ?? undefined,
    state: user.personalInfo?.state ?? undefined,
    country: user.personalInfo?.country ?? undefined,
    profession: user.personalInfo?.profession ?? undefined,
    company: user.personalInfo?.company ?? undefined,
    nationality: user.personalInfo?.nationality ?? undefined,
    gender: user.personalInfo?.gender ?? undefined,
    maritalStatus: user.personalInfo?.maritalStatus ?? undefined,
    createdAt: user.createdAt ?? nowIso,
    updatedAt: user.updatedAt ?? nowIso,
    verified: false,
    isFromUser: true,
    userRole: user.role,
    userStatus: user.status,
  } as Person
}

/**
 * Crea una nueva persona
 */
export async function createPerson(data: CreatePersonDto): Promise<{ success: boolean; data?: Person; error?: string }> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    return { success: false, error: 'No autenticado' }
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people`, {
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
        error: errorData.message || `Error al crear persona: ${response.status}` 
      }
    }

    const person = await response.json()
    return { success: true, data: person }
  } catch (error) {
    console.error('Error creating person:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido al crear persona' 
    }
  }
}

/**
 * Actualiza una persona existente
 */
export async function updatePerson(id: string, data: UpdatePersonDto): Promise<Person> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to update person: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error updating person:', error)
    throw error
  }
}

/**
 * Elimina una persona (soft delete)
 */
export async function deletePerson(id: string): Promise<void> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to delete person: ${response.status}`)
    }
  } catch (error) {
    console.error('Error deleting person:', error)
    throw error
  }
}

/**
 * Busca personas por DNI
 */
export async function searchPersonByDNI(dni: string): Promise<Person | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/search-by-dni/${dni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to search person by DNI: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error searching person by DNI:', error)
    throw error
  }
}

/**
 * Busca personas por email
 */
export async function searchPersonByEmail(email: string): Promise<Person | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/people/search-by-email/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to search person by email: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error searching person by email:', error)
    throw error
  }
}

/**
 * Obtiene estadísticas de personas (admin only)
 */
export async function getPersonsStatistics(): Promise<{
  total: number
  byCountry: Record<string, number>
  byState: Record<string, number>
  byCity: Record<string, number>
  recentlyCreated: number
}> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/persons/statistics`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch persons statistics: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching persons statistics:', error)
    throw error
  }
}
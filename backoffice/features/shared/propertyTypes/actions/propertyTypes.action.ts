'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'
import { revalidatePath } from 'next/cache'

export interface PropertyType {
  id: string
  name: string
  description?: string
  hasBedrooms?: boolean
  hasBathrooms?: boolean
  hasBuiltSquareMeters?: boolean
  hasLandSquareMeters?: boolean
  hasParkingSpaces?: boolean
  hasFloors?: boolean
  hasConstructionYear?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreatePropertyTypeDto {
  name: string
  description?: string
  hasBedrooms?: boolean
  hasBathrooms?: boolean
  hasBuiltSquareMeters?: boolean
  hasLandSquareMeters?: boolean
  hasParkingSpaces?: boolean
  hasFloors?: boolean
  hasConstructionYear?: boolean
}

export interface UpdatePropertyTypeDto {
  name?: string
  description?: string
  hasBedrooms?: boolean
  hasBathrooms?: boolean
  hasBuiltSquareMeters?: boolean
  hasLandSquareMeters?: boolean
  hasParkingSpaces?: boolean
  hasFloors?: boolean
  hasConstructionYear?: boolean
}

export interface UpdatePropertyTypeFeaturesDto {
  hasBedrooms?: boolean;
  hasBathrooms?: boolean;
  hasBuiltSquareMeters?: boolean;
  hasLandSquareMeters?: boolean;
  hasParkingSpaces?: boolean;
  hasFloors?: boolean;
  hasConstructionYear?: boolean;
}

/** Resultado de una acción de escritura: el motivo del error llega al formulario tal como lo da la API. */
export type PropertyTypeActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }

/** Texto de error de la API (puede venir como lista de mensajes de validación). */
async function readApiError(response: Response, fallback: string): Promise<string> {
  const body = await response.text().catch(() => '')
  try {
    const parsed = JSON.parse(body) as { message?: string | string[] }
    if (Array.isArray(parsed.message) && parsed.message.length) return parsed.message.join('. ')
    if (typeof parsed.message === 'string' && parsed.message.trim()) return parsed.message
  } catch {
    /* cuerpo que no es JSON */
  }
  return fallback
}

const SESSION_EXPIRED = 'La sesión expiró. Vuelve a iniciar sesión.'

/**
 * Obtiene todos los tipos de propiedad
 */
export async function getPropertyTypes(search?: string): Promise<PropertyType[]> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  const url = new URL(`${env.backendApiUrl}/property-types`)
  if (search?.trim()) {
    url.searchParams.set('search', search.trim())
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch property types: ${response.status}`)
  }

  return response.json()
}

/**
 * Obtiene un tipo de propiedad por ID
 */
export async function getPropertyType(id: string): Promise<PropertyType> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  const response = await fetch(`${env.backendApiUrl}/property-types/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch property type: ${response.status}`)
  }

  return response.json()
}

/**
 * Crea un nuevo tipo de propiedad
 */
export async function createPropertyType(data: CreatePropertyTypeDto): Promise<PropertyType> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  const response = await fetch(`${env.backendApiUrl}/property-types`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store'
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.error('createPropertyType failed', response.status, body)
    let message = 'No se pudo crear el tipo de propiedad'
    try {
      const parsed = JSON.parse(body) as { message?: string | string[] }
      if (Array.isArray(parsed.message)) message = parsed.message.join(', ')
      else if (parsed.message) message = parsed.message
    } catch {
      /* keep fallback */
    }
    throw new Error(message)
  }

  revalidatePath('/properties/propertyTypes')
  return response.json()
}

/**
 * Actualiza un tipo de propiedad existente
 */
export async function updatePropertyType(id: string, data: UpdatePropertyTypeDto): Promise<PropertyTypeActionResult<PropertyType>> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return { success: false, error: SESSION_EXPIRED }

  let response: Response
  try {
    response = await fetch(`${env.backendApiUrl}/property-types/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })
  } catch {
    return { success: false, error: 'No se pudo contactar al servidor. Inténtalo de nuevo.' }
  }

  if (!response.ok) {
    return { success: false, error: await readApiError(response, 'No se pudo actualizar el tipo de propiedad') }
  }

  revalidatePath('/properties/propertyTypes')
  return { success: true, data: await response.json() }
}

/**
 * Actualiza las características de un tipo de propiedad
 */
export async function updatePropertyTypeFeatures(id: string, data: UpdatePropertyTypeFeaturesDto): Promise<PropertyTypeActionResult<PropertyType>> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return { success: false, error: SESSION_EXPIRED }

  let response: Response
  try {
    response = await fetch(`${env.backendApiUrl}/property-types/${id}/features`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })
  } catch {
    return { success: false, error: 'No se pudo contactar al servidor. Inténtalo de nuevo.' }
  }

  if (!response.ok) {
    return { success: false, error: await readApiError(response, 'No se pudo actualizar la característica') }
  }

  revalidatePath('/properties/propertyTypes')
  return { success: true, data: await response.json() }
}

/**
 * Elimina un tipo de propiedad (soft delete)
 */
export async function deletePropertyType(id: string): Promise<PropertyTypeActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) return { success: false, error: SESSION_EXPIRED }

  let response: Response
  try {
    response = await fetch(`${env.backendApiUrl}/property-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })
  } catch {
    return { success: false, error: 'No se pudo contactar al servidor. Inténtalo de nuevo.' }
  }

  if (!response.ok) {
    return { success: false, error: await readApiError(response, 'No se pudo eliminar el tipo de propiedad') }
  }

  revalidatePath('/properties/propertyTypes')
  return { success: true, data: undefined }
}

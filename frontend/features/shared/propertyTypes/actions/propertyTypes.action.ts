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
    throw new Error(`Failed to create property type: ${response.status}`)
  }

  revalidatePath('/backOffice/properties/propertyTypes')
  return response.json()
}

/**
 * Actualiza un tipo de propiedad existente
 */
export async function updatePropertyType(id: string, data: UpdatePropertyTypeDto): Promise<PropertyType> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  const response = await fetch(`${env.backendApiUrl}/property-types/${id}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to update property type: ${response.status}`)
  }

  revalidatePath('/backOffice/properties/propertyTypes')
  return response.json()
}

/**
 * Actualiza las características de un tipo de propiedad
 */
export async function updatePropertyTypeFeatures(id: string, data: UpdatePropertyTypeFeaturesDto): Promise<PropertyType> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  const response = await fetch(`${env.backendApiUrl}/property-types/${id}/features`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to update property type features: ${response.status}`)
  }

  revalidatePath('/backOffice/properties/propertyTypes')
  return response.json()
}

/**
 * Elimina un tipo de propiedad (soft delete)
 */
export async function deletePropertyType(id: string): Promise<void> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  const response = await fetch(`${env.backendApiUrl}/property-types/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error(`Failed to delete property type: ${response.status}`)
  }

  revalidatePath('/backOffice/properties/propertyTypes')
}
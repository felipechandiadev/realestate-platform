'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

export interface SystemConfig {
  id: string
  key: string
  value: any
  description?: string
  category: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface AppSettings {
  id: string
  appName: string
  appDescription: string
  contactEmail: string
  contactPhone: string
  address: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  enableRegistration: boolean
  maintenanceMode: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateConfigDto {
  key: string
  value: any
  description?: string
  category: string
  isPublic?: boolean
}

export interface UpdateConfigDto {
  value?: any
  description?: string
  category?: string
  isPublic?: boolean
}

/**
 * Obtiene toda la configuración del sistema (admin only)
 */
export async function getSystemConfig(): Promise<SystemConfig[]> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch system config: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching system config:', error)
    throw error
  }
}

/**
 * Obtiene la configuración pública del sistema
 */
export async function getPublicConfig(): Promise<SystemConfig[]> {
  try {
    const response = await fetch(`${env.backendApiUrl}/config/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch public config: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching public config:', error)
    throw error
  }
}

/**
 * Obtiene un valor de configuración específico por clave
 */
export async function getConfigValue(key: string): Promise<SystemConfig> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config/${key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch config value: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching config value:', error)
    throw error
  }
}

/**
 * Crea una nueva configuración (admin only)
 */
export async function createConfig(data: CreateConfigDto): Promise<SystemConfig> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to create config: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error creating config:', error)
    throw error
  }
}

/**
 * Actualiza una configuración existente (admin only)
 */
export async function updateConfig(key: string, data: UpdateConfigDto): Promise<SystemConfig> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config/${key}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to update config: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error updating config:', error)
    throw error
  }
}

/**
 * Elimina una configuración (admin only)
 */
export async function deleteConfig(key: string): Promise<void> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config/${key}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to delete config: ${response.status}`)
    }
  } catch (error) {
    console.error('Error deleting config:', error)
    throw error
  }
}

/**
 * Obtiene la configuración general de la aplicación
 */
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const response = await fetch(`${env.backendApiUrl}/config/app-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch app settings: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching app settings:', error)
    throw error
  }
}

/**
 * Actualiza la configuración general de la aplicación (admin only)
 */
export async function updateAppSettings(data: Partial<AppSettings>): Promise<AppSettings> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config/app-settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to update app settings: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error updating app settings:', error)
    throw error
  }
}

/**
 * Restaura la configuración por defecto (admin only)
 */
export async function resetConfigToDefaults(): Promise<void> {
  const session = await getServerSession(authOptions)
  
  if (!session?.accessToken) {
    throw new Error('No authenticated')
  }

  try {
    const response = await fetch(`${env.backendApiUrl}/config/reset-defaults`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Failed to reset config to defaults: ${response.status}`)
    }
  } catch (error) {
    console.error('Error resetting config to defaults:', error)
    throw error
  }
}
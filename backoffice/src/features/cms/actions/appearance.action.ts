'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'
import type { AppearanceColors } from '@realestate/ui/theme/appearance-theme'

export type AppearanceTemplate = AppearanceColors & {
  id: string
  name: string
  isSystem: boolean
  sortOrder: number
}

function readApiError(status: number, errorText: string, fallback: string): string {
  try {
    const parsed = JSON.parse(errorText) as { message?: string | string[] }
    if (Array.isArray(parsed.message)) return parsed.message.join('. ')
    if (typeof parsed.message === 'string' && parsed.message.trim()) return parsed.message
  } catch {
    if (errorText.trim()) return errorText
  }
  return `${fallback}: ${status}`
}

export async function getAppearance(): Promise<AppearanceColors> {
  const session = await getServerSession(authOptions)
  const headers: Record<string, string> = {}
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`

  const res = await fetch(`${env.backendApiUrl}/appearance`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo cargar la apariencia'))
  }
  return res.json()
}

export async function updateAppearance(colors: AppearanceColors): Promise<AppearanceColors> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')

  const res = await fetch(`${env.backendApiUrl}/appearance`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(colors),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo guardar la apariencia'))
  }
  return res.json()
}

async function authorizedJson(path: string, init: RequestInit, fallback: string) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')
  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
  }
  if (init.body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${env.backendApiUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, fallback))
  }
  return res.json()
}

export async function listAppearanceTemplates(): Promise<AppearanceTemplate[]> {
  return authorizedJson('/appearance/templates', { method: 'GET' }, 'No se pudieron cargar las plantillas')
}

export async function createAppearanceTemplate(
  name: string,
  colors: AppearanceColors,
): Promise<AppearanceTemplate> {
  return authorizedJson(
    '/appearance/templates',
    { method: 'POST', body: JSON.stringify({ name, ...colors }) },
    'No se pudo guardar la plantilla',
  )
}

export async function renameAppearanceTemplate(id: string, name: string): Promise<AppearanceTemplate> {
  return authorizedJson(
    `/appearance/templates/${id}`,
    { method: 'PATCH', body: JSON.stringify({ name }) },
    'No se pudo renombrar la plantilla',
  )
}

export async function deleteAppearanceTemplate(id: string): Promise<{ id: string }> {
  return authorizedJson(
    `/appearance/templates/${id}`,
    { method: 'DELETE' },
    'No se pudo eliminar la plantilla',
  )
}

'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

export type ListingsFilterVariant = 'classic' | 'sidebar_v2'

export type PortalListingsSettings = {
  id?: string
  listingsFilterVariant: ListingsFilterVariant
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

export async function getPortalListingsSettings(): Promise<PortalListingsSettings> {
  const session = await getServerSession(authOptions)
  const headers: Record<string, string> = {}
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`

  const res = await fetch(`${env.backendApiUrl}/portal-listings-settings`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo cargar la configuración de listados'))
  }
  const data = await res.json()
  return {
    id: data?.id,
    listingsFilterVariant:
      data?.listingsFilterVariant === 'sidebar_v2' ? 'sidebar_v2' : 'classic',
  }
}

export async function updatePortalListingsSettings(
  listingsFilterVariant: ListingsFilterVariant,
): Promise<PortalListingsSettings> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')

  const res = await fetch(`${env.backendApiUrl}/portal-listings-settings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ listingsFilterVariant }),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo guardar la configuración de listados'))
  }
  const data = await res.json()
  return {
    id: data?.id,
    listingsFilterVariant:
      data?.listingsFilterVariant === 'sidebar_v2' ? 'sidebar_v2' : 'classic',
  }
}

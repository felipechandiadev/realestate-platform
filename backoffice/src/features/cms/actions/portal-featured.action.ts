'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

export type FeaturedLayoutDesktop = 'band' | 'grid'

export type PortalFeaturedSettings = {
  id?: string
  layoutDesktop: FeaturedLayoutDesktop
  gridColumns: number
  gridRows: number
  pageSize: number
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function normalizeSettings(data: any): PortalFeaturedSettings {
  const cols = clamp(Number(data?.gridColumns), 1, 4, 3)
  const rows = clamp(Number(data?.gridRows), 1, 4, 2)
  return {
    id: data?.id,
    layoutDesktop: data?.layoutDesktop === 'grid' ? 'grid' : 'band',
    gridColumns: cols,
    gridRows: rows,
    pageSize: Math.min(16, cols * rows),
  }
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

export async function getPortalFeaturedSettings(): Promise<PortalFeaturedSettings> {
  const session = await getServerSession(authOptions)
  const headers: Record<string, string> = {}
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`

  const res = await fetch(`${env.backendApiUrl}/portal-featured-settings`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo cargar la configuración de destacadas'))
  }
  return normalizeSettings(await res.json())
}

export async function updatePortalFeaturedSettings(input: {
  layoutDesktop: FeaturedLayoutDesktop
  gridColumns: number
  gridRows: number
}): Promise<PortalFeaturedSettings> {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')

  const res = await fetch(`${env.backendApiUrl}/portal-featured-settings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      layoutDesktop: input.layoutDesktop,
      gridColumns: input.gridColumns,
      gridRows: input.gridRows,
    }),
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo guardar la configuración de destacadas'))
  }
  return normalizeSettings(await res.json())
}

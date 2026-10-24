'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

/** Contenido de "Nosotros" tal como lo devuelve el core. */
export interface AboutUsContent {
  bio: string
  mision: string
  vision: string
  multimediaUrl?: string
}

function normalizeAboutUsPayload(data: unknown): AboutUsContent | null {
  console.log('[normalizeAboutUsPayload] Input:', data)

  if (Array.isArray(data)) {
    const result = data[0] ?? null
    console.log('[normalizeAboutUsPayload] From array:', result)
    return result
  }

  const wrapped = data && typeof data === 'object' && 'data' in data ? data.data : undefined
  if (Array.isArray(wrapped)) {
    const result = wrapped[0] ?? null
    console.log('[normalizeAboutUsPayload] From data.data:', result)
    return result
  }

  if (data && typeof data === 'object') {
    console.log('[normalizeAboutUsPayload] Direct object:', data)
    return data as AboutUsContent
  }

  console.log('[normalizeAboutUsPayload] Returning null')
  return null
}

export async function getAboutUs() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) return { success: false, error: 'No autorizado' }

    const res = await fetch(`${env.backendApiUrl}/about-us`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
      cache: 'no-store',
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      return { success: false, error: payload?.message || `HTTP ${res.status}` }
    }

    const raw = await res.json()
    console.log('[getAboutUs] Raw response:', raw)
    const data = normalizeAboutUsPayload(raw)
    console.log('[getAboutUs] Normalized data:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[getAboutUs] Error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Public (anonymous) variant used by the portal
export async function getPublicAboutUs() {
  try {
    const res = await fetch(`${env.backendApiUrl}/about-us`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      const payload = await res.json().catch(() => null)
      return { success: false, error: payload?.message || `HTTP ${res.status}` }
    }

    const raw = await res.json()
    const data = normalizeAboutUsPayload(raw)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
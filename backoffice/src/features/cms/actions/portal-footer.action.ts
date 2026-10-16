'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

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

export async function getPortalFooter() {
  const session = await getServerSession(authOptions)
  const headers: Record<string, string> = {}
  if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`

  const res = await fetch(`${env.backendApiUrl}/portal-footer`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo cargar el footer'))
  }
  return res.json()
}

export async function updatePortalFooter(payload: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')

  const res = await fetch(`${env.backendApiUrl}/portal-footer`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${session.accessToken}` },
    body: payload,
  })
  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(readApiError(res.status, errorText, 'No se pudo guardar el footer'))
  }
  return res.json()
}

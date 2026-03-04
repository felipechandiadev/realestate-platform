'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

type IdentityPayload = FormData | Record<string, unknown>

function ensureFormData(payload: IdentityPayload): FormData {
  if (payload instanceof FormData) {
    return payload
  }

  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return
    }

    if (value instanceof Blob) {
      formData.append(key, value)
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) {
          return
        }

        if (item instanceof Blob) {
          formData.append(key, item)
        } else if (typeof item === 'object') {
          formData.append(key, JSON.stringify(item))
        } else {
          formData.append(key, String(item))
        }
      })
      return
    }

    if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value))
    } else {
      formData.append(key, String(value))
    }
  })

  return formData
}

// Acción pública para obtener solo la URL del logo
export async function getIdentityLogoUrl(): Promise<string | null> {
  try {
    const res = await fetch(`${env.backendApiUrl}/identities/logo-url`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.logoUrl ?? null;
  } catch (err) {
    console.warn('[getIdentityLogoUrl] fetch failed:', err);
    return null;
  }
}

export async function getIdentity() {
  // Try to get session, but don't require it for public identity data
  const session = await getServerSession(authOptions)

  const headers: Record<string, string> = {}
  if (session?.accessToken) {
    headers.Authorization = `Bearer ${session.accessToken}`
  }

  try {
    const res = await fetch(`${env.backendApiUrl}/identities/last`, {
      headers,
    })

    if (!res.ok) {
      if (res.status === 404) return null // No identity found
      throw new Error('Failed to fetch identity')
    }

    return res.json()
  } catch (err) {
    console.warn('[getIdentity] fetch failed:', err)
    return null
  }
}

export async function updateIdentity(id: string, payload: IdentityPayload) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')

  const formData = ensureFormData(payload)

  const res = await fetch(`${env.backendApiUrl}/identities/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Update identity failed:', res.status, errorText)
    throw new Error(`Failed to update identity: ${res.status} ${errorText}`)
  }

  return res.json()
}

export async function createIdentity(payload: IdentityPayload) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) throw new Error('Unauthorized')

  const formData = ensureFormData(payload)

  const res = await fetch(`${env.backendApiUrl}/identities`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Create identity failed:', res.status, errorText)
    throw new Error(`Failed to create identity: ${res.status} ${errorText}`)
  }

  return res.json()
}
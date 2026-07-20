'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'

function normalizeAboutUsPayload(data: any) {
  console.log('[normalizeAboutUsPayload] Input:', data)

  if (Array.isArray(data)) {
    const result = data[0] ?? null
    console.log('[normalizeAboutUsPayload] From array:', result)
    return result
  }

  if (Array.isArray(data?.data)) {
    const result = data.data[0] ?? null
    console.log('[normalizeAboutUsPayload] From data.data:', result)
    return result
  }

  if (data && typeof data === 'object') {
    console.log('[normalizeAboutUsPayload] Direct object:', data)
    return data
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

export async function createDefaultAboutUs() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) return { success: false, error: 'No autorizado' }

    const payload = {
      bio: 'Somos una plataforma inmobiliaria líder en Chile con más de 15 años de experiencia conectando compradores, vendedores e inversores. Nuestro equipo de profesionales se dedica a hacer del proceso inmobiliario algo transparente, seguro y eficiente.',
      mision: 'Facilitar transacciones inmobiliarias seguras, transparentes y accesibles para todos los chilenos, proporcionando información de calidad y asesoría profesional.',
      vision: 'Ser la plataforma inmobiliaria de referencia en Chile, transformando la manera en que las personas compran, venden y arriendan propiedades.',
    }

    const res = await fetch(`${env.backendApiUrl}/about-us`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => null)
      return { success: false, error: data?.message || `HTTP ${res.status}` }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

export async function updateAboutUs(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) return { success: false, error: 'No autorizado' }

    let multimediaUrl: string | undefined = undefined
    const multimediaFile = formData.get('multimedia')

    if (multimediaFile instanceof File && multimediaFile.size > 0) {
      console.log('[updateAboutUs] Uploading multimedia:', multimediaFile.name, multimediaFile.size);
      const uploadFormData = new FormData()
      uploadFormData.append('file', multimediaFile)
      uploadFormData.append(
        'type',
        multimediaFile.type.startsWith('video/') ? 'PROPERTY_VIDEO' : 'PROPERTY_IMG',
      )

      console.log('[updateAboutUs] FormData prepared with type:', multimediaFile.type.startsWith('video/') ? 'PROPERTY_VIDEO' : 'PROPERTY_IMG');

      const uploadRes = await fetch(`${env.backendApiUrl}/multimedia/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: uploadFormData,
      })

      console.log('[updateAboutUs] Multimedia upload response status:', uploadRes.status);

      if (!uploadRes.ok) {
        const uploadPayload = await uploadRes.json().catch(() => null)
        console.error('[updateAboutUs] Multimedia upload failed:', uploadRes.status, uploadPayload);
        return {
          success: false,
          error: uploadPayload?.message || uploadPayload?.error || `Error subiendo multimedia (${uploadRes.status})`,
        }
      }

      const uploadData = await uploadRes.json().catch(() => {
        console.error('[updateAboutUs] Failed to parse upload response');
        return null;
      })
      console.log('[updateAboutUs] Upload response data:', uploadData);
      
      multimediaUrl = typeof uploadData?.url === 'string' ? uploadData.url : undefined
      console.log('[updateAboutUs] Multimedia URL extracted:', multimediaUrl);
    }

    const payload = {
      bio: String(formData.get('bio') ?? ''),
      mision: String(formData.get('mision') ?? ''),
      vision: String(formData.get('vision') ?? ''),
      ...(multimediaUrl ? { multimediaUrl } : {}),
    }

    console.log('[updateAboutUs] Payload to send:', payload);

    const existingRes = await fetch(`${env.backendApiUrl}/about-us`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!existingRes.ok) {
      const existingPayload = await existingRes.json().catch(() => null)
      console.error('[updateAboutUs] Failed to fetch existing AboutUs:', existingRes.status, existingPayload);
      return { success: false, error: existingPayload?.message || `HTTP ${existingRes.status}` }
    }

    const existingData = await existingRes.json().catch(() => null)
    console.log('[updateAboutUs] Existing data:', existingData);
    
    const entries = Array.isArray(existingData)
      ? existingData
      : Array.isArray(existingData?.data)
        ? existingData.data
        : []
    const current = entries[0]

    const requestUrl = current?.id
      ? `${env.backendApiUrl}/about-us/${current.id}`
      : `${env.backendApiUrl}/about-us`
    const requestMethod = current?.id ? 'PATCH' : 'POST'

    console.log(`[updateAboutUs] Sending ${requestMethod} to ${requestUrl}`);

    const res = await fetch(requestUrl, {
      method: requestMethod,
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorPayload = await res.json().catch(() => null)
      console.error(`[updateAboutUs] ${requestMethod} failed:`, res.status, errorPayload);
      return { success: false, error: errorPayload?.message || `HTTP ${res.status}` }
    }

    console.log('[updateAboutUs] Update successful');
    return { success: true }
  } catch (error) {
    console.error('[updateAboutUs] Exception:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
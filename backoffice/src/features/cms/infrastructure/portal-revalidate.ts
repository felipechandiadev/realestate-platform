/**
 * Avisa al portal que cambió contenido del CMS para que invalide su caché.
 *
 * El portal guarda esa configuración hasta 5 minutos; sin este aviso el sitio público
 * tardaría ese tiempo en mostrar lo recién guardado. Es de mejor esfuerzo: si falla
 * (portal caído, secreto sin configurar) el guardado NO falla, solo se registra un aviso
 * y el cambio se ve cuando expire la caché.
 *
 * Solo para uso en servidor (server actions).
 */
export type PortalCacheTag =
  | 'portal-header'
  | 'portal-footer'
  | 'portal-listings-settings'
  | 'identity'
  | 'appearance'
  | 'public-listings'
  | 'public-featured'
  | 'sitemap'

const TIMEOUT_MS = 5000

export async function revalidatePortal(tags: PortalCacheTag[]): Promise<boolean> {
  const secret = process.env.REVALIDATE_SECRET?.trim()
  if (!secret) {
    console.warn('[revalidatePortal] REVALIDATE_SECRET no está definido: el portal reflejará el cambio al expirar su caché (hasta 5 min).')
    return false
  }

  // En el servidor conviene la dirección interna del portal; si no, la pública.
  const base = (process.env.PORTAL_INTERNAL_URL || process.env.NEXT_PUBLIC_PORTAL_URL || '').trim().replace(/\/+$/, '')
  if (!base) {
    console.warn('[revalidatePortal] No hay URL del portal (PORTAL_INTERNAL_URL / NEXT_PUBLIC_PORTAL_URL).')
    return false
  }

  try {
    const res = await fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-revalidate-secret': secret },
      body: JSON.stringify({ tags }),
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) {
      console.warn(`[revalidatePortal] El portal respondió ${res.status} al invalidar ${tags.join(', ')}.`)
      return false
    }
    return true
  } catch (error) {
    console.warn('[revalidatePortal] No se pudo avisar al portal:', error instanceof Error ? error.message : error)
    return false
  }
}

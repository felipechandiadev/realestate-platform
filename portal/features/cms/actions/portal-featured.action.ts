'use server'

import { env } from '@/lib/env'

export type FeaturedLayoutDesktop = 'band' | 'grid'

export type PortalFeaturedSettings = {
  layoutDesktop: FeaturedLayoutDesktop
  gridColumns: number
  gridRows: number
  pageSize: number
}

const DEFAULTS: PortalFeaturedSettings = {
  layoutDesktop: 'band',
  gridColumns: 3,
  gridRows: 2,
  pageSize: 6,
}

function clamp(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

export async function getPortalFeaturedSettings(): Promise<PortalFeaturedSettings> {
  try {
    const res = await fetch(`${env.backendApiUrl}/portal-featured-settings`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (!res.ok) return DEFAULTS
    const data = await res.json()
    const cols = clamp(Number(data?.gridColumns), 1, 4, 3)
    const rows = clamp(Number(data?.gridRows), 1, 4, 2)
    return {
      layoutDesktop: data?.layoutDesktop === 'grid' ? 'grid' : 'band',
      gridColumns: cols,
      gridRows: rows,
      pageSize: Math.min(16, cols * rows),
    }
  } catch {
    return DEFAULTS
  }
}

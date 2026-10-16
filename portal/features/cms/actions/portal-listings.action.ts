'use server'

import { env } from '@/lib/env'

export type ListingsFilterVariant = 'classic' | 'sidebar_v2'

export type PortalListingsSettings = {
  listingsFilterVariant: ListingsFilterVariant
}

export async function getPortalListingsSettings(): Promise<PortalListingsSettings> {
  try {
    const res = await fetch(`${env.backendApiUrl}/portal-listings-settings`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      return { listingsFilterVariant: 'classic' }
    }
    const data = await res.json()
    return {
      listingsFilterVariant:
        data?.listingsFilterVariant === 'sidebar_v2' ? 'sidebar_v2' : 'classic',
    }
  } catch {
    return { listingsFilterVariant: 'classic' }
  }
}

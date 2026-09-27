import { env } from '@/lib/env';
import { FALLBACK_PORTAL_HEADER, type PortalHeaderConfig } from '@/app/ui/portal-header';

export async function getPortalHeader(): Promise<PortalHeaderConfig> {
  try {
    const res = await fetch(`${env.backendApiUrl}/portal-header`, { cache: 'no-store' });
    if (!res.ok) return FALLBACK_PORTAL_HEADER;
    const data = (await res.json()) as Partial<PortalHeaderConfig>;
    return {
      ...FALLBACK_PORTAL_HEADER,
      ...data,
      logoUrl: data.logoUrl ?? null,
      navItems: data.navItems?.length ? data.navItems : FALLBACK_PORTAL_HEADER.navItems,
      accountItems: data.accountItems?.length ? data.accountItems : FALLBACK_PORTAL_HEADER.accountItems,
    };
  } catch (err) {
    console.warn('[getPortalHeader] fetch failed:', err);
    return FALLBACK_PORTAL_HEADER;
  }
}

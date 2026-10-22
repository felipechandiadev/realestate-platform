import { env } from '@/lib/env';
import { FALLBACK_PORTAL_FOOTER, type PortalFooterConfig } from '@/app/ui/portal-footer';

export async function getPortalFooter(): Promise<PortalFooterConfig> {
  try {
    const res = await fetch(`${env.backendApiUrl}/portal-footer`, {
      next: { revalidate: 300, tags: ['portal-footer'] },
    });
    if (!res.ok) return FALLBACK_PORTAL_FOOTER;
    const data = (await res.json()) as Partial<PortalFooterConfig>;
    return {
      ...FALLBACK_PORTAL_FOOTER,
      ...data,
      logoUrl: data.logoUrl ?? null,
      menuItems: data.menuItems?.length ? data.menuItems : FALLBACK_PORTAL_FOOTER.menuItems,
    };
  } catch (err) {
    console.warn('[getPortalFooter] fetch failed:', err);
    return FALLBACK_PORTAL_FOOTER;
  }
}

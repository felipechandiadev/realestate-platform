import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { portalPublicOrigin } from '@/shared/lib/seo-core';
import { buildSitemapEntries, sitemapRowsFrom, type SitemapRow } from '@/shared/lib/sitemap-core';

async function fetchRows(path: string): Promise<SitemapRow[]> {
  try {
    const res = await fetch(`${env.backendApiUrl}${path}`, {
      next: { revalidate: 3600, tags: ['public-listings', 'sitemap'] },
    });
    if (!res.ok) return [];
    return sitemapRowsFrom(await res.json());
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // /articles sin sesión devuelve solo artículos activos.
  const [properties, articles] = await Promise.all([
    fetchRows('/properties/public'),
    fetchRows('/articles'),
  ]);
  return buildSitemapEntries(portalPublicOrigin(), properties, articles);
}

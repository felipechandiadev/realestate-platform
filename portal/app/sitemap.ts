import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';
import { portalPublicOrigin } from '@/app/properties/property/[id]/share-metadata';
import { propertyPublicPath } from '@/app/properties/property/[id]/share-links';

type PublicPropertyRow = { id: string; updatedAt?: string; publishedAt?: string };

async function listPublishedPropertyIds(): Promise<PublicPropertyRow[]> {
  try {
    const res = await fetch(`${env.backendApiUrl}/properties/public`, {
      next: { revalidate: 3600, tags: ['public-listings', 'sitemap'] },
    });
    if (!res.ok) return [];
    const payload = await res.json();
    const data = Array.isArray(payload) ? payload : payload?.data ?? [];
    return (Array.isArray(data) ? data : [])
      .map((row: PublicPropertyRow) => ({
        id: String(row.id),
        updatedAt: row.updatedAt,
        publishedAt: row.publishedAt,
      }))
      .filter((row) => row.id);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = portalPublicOrigin();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/properties',
    '/properties/sale',
    '/properties/rent',
    '/aboutUs',
    '/ourTeam',
    '/services',
    '/blog',
    '/testimonials',
    '/sell-property',
    '/rent-property',
    '/valuation',
    '/privacidad',
  ].map((path) => ({
    url: `${origin}${path || '/'}`,
    lastModified: now,
    changeFrequency: path.startsWith('/properties') ? 'hourly' : 'weekly',
    priority: path === '' || path.startsWith('/properties') ? 0.9 : 0.6,
  }));

  const properties = await listPublishedPropertyIds();
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((row) => ({
    url: `${origin}${propertyPublicPath(row.id)}`,
    lastModified: row.updatedAt || row.publishedAt || now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [...staticRoutes, ...propertyRoutes];
}

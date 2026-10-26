/**
 * Arma las entradas del sitemap (sin dependencias de Next; se prueba con node --test).
 */

export type SitemapRow = { id: string; updatedAt?: string; publishedAt?: string; createdAt?: string };

export type SitemapEntry = {
  url: string;
  lastModified: string | Date;
  changeFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  priority: number;
};

export const STATIC_SITEMAP_PATHS = [
  '',
  '/properties',
  '/properties/sale',
  '/properties/rent',
  '/aboutUs',
  '/ourTeam',
  '/services/management',
  '/blog',
  '/testimonials',
  '/sell-property',
  '/rent-property',
  '/valuation',
  '/privacidad',
] as const;

/** Extrae filas `{ id, fechas }` de una respuesta de la API (array o `{ data: [] }`). */
export function sitemapRowsFrom(payload: unknown): SitemapRow[] {
  const data = Array.isArray(payload)
    ? payload
    : (payload as { data?: unknown } | null)?.data;
  if (!Array.isArray(data)) return [];
  return data
    .filter((row) => row && row.id)
    .map((row) => ({
      id: String(row.id),
      updatedAt: row.updatedAt,
      publishedAt: row.publishedAt,
      createdAt: row.createdAt,
    }));
}

export function buildSitemapEntries(
  origin: string,
  properties: SitemapRow[],
  articles: SitemapRow[],
  now: Date = new Date(),
): SitemapEntry[] {
  const staticRoutes: SitemapEntry[] = STATIC_SITEMAP_PATHS.map((path) => ({
    url: `${origin}${path || '/'}`,
    lastModified: now,
    changeFrequency: path.startsWith('/properties') ? 'hourly' : 'weekly',
    priority: path === '' || path.startsWith('/properties') ? 0.9 : 0.6,
  }));

  const propertyRoutes: SitemapEntry[] = properties.map((row) => ({
    url: `${origin}/properties/property/${encodeURIComponent(row.id)}`,
    lastModified: row.updatedAt || row.publishedAt || now,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const articleRoutes: SitemapEntry[] = articles.map((row) => ({
    url: `${origin}/blog/article/${encodeURIComponent(row.id)}`,
    lastModified: row.updatedAt || row.createdAt || now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...propertyRoutes, ...articleRoutes];
}

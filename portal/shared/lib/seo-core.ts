/**
 * Utilidades SEO sin dependencias de Next (se prueban con node --test).
 */

/** Origen público del portal, sin barra final (robots, sitemap, canonical, Open Graph). */
export function portalPublicOrigin(env: Record<string, string | undefined> = process.env): string {
  const raw =
    env.NEXT_PUBLIC_PORTAL_URL ||
    env.PORTAL_URL ||
    env.NEXTAUTH_URL ||
    'http://localhost:8001';
  return raw.replace(/\/+$/, '');
}

export type PageSeo = {
  /** Ruta pública, empezando con "/" ("/" para la portada). */
  path: string;
  title: string;
  description: string;
};

/** Metadatos de una página pública: título, descripción, canonical y Open Graph. */
export function pageMetadata({ path, title, description }: PageSeo, origin = portalPublicOrigin()) {
  const url = path === '/' ? `${origin}/` : `${origin}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' as const, locale: 'es_CL' },
  };
}

/** Recorta un texto plano para usarlo como meta descripción. */
export function metaDescription(text: string | null | undefined, max = 160): string {
  const clean = (text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trimEnd()}…`;
}

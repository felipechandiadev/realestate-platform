import type { Metadata } from 'next';
import { env } from '@/lib/env';
import type { Property } from './actions';
import { propertyPublicPath } from './share-links';

const VIDEO_URL = /\.(mp4|webm|ogg|mov)(\?|#|$)/i;

export function portalPublicOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    process.env.PORTAL_URL ||
    process.env.NEXTAUTH_URL ||
    'http://localhost:8001';
  return raw.replace(/\/+$/, '');
}

function absoluteMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const cleaned = url.replace('/../', '/').trim();
  if (!cleaned) return undefined;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (cleaned.startsWith('/')) return `${env.backendApiUrl}${cleaned}`;
  return cleaned;
}

function isVideoMedia(input: { url?: string | null; type?: string | null; format?: string | null }): boolean {
  const kind = `${input.format || ''} ${input.type || ''}`.toUpperCase();
  if (kind.includes('VIDEO')) return true;
  return VIDEO_URL.test(input.url || '');
}

export function formatSharePrice(property: Pick<Property, 'price' | 'currencyPrice'>): string {
  if (property.currencyPrice === 'UF') {
    return `${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 2 }).format(property.price)} UF`;
  }
  if (property.currencyPrice === 'CLP') {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(property.price);
  }
  return `${property.price}`;
}

export function buildShareDescription(property: Property): string {
  const operation = property.operationType === 'RENT' ? 'Arriendo' : 'Venta';
  const place = [property.city, property.state].filter(Boolean).join(', ');
  const summary = [operation, formatSharePrice(property), place].filter(Boolean).join(' · ');
  const description = property.description?.replace(/\s+/g, ' ').trim();
  if (!description) return summary;
  const clipped = description.length > 140 ? `${description.slice(0, 139).trimEnd()}…` : description;
  return summary ? `${summary}. ${clipped}` : clipped;
}

export function pickShareImage(property: Property): { url: string; alt: string; width?: number; height?: number } | undefined {
  const title = property.title?.trim() || 'Propiedad';
  const candidates = [
    property.mainImageUrl ? { url: property.mainImageUrl, type: 'IMG', format: 'IMG' } : null,
    ...(property.multimedia || []),
  ].filter(Boolean) as Array<{ url?: string | null; type?: string | null; format?: string | null; width?: number | null; height?: number | null }>;

  const image = candidates.find((item) => item.url && !isVideoMedia(item));
  const url = absoluteMediaUrl(image?.url);
  if (!url) return undefined;

  const width = image?.width && image.width > 0 ? image.width : undefined;
  const height = image?.height && image.height > 0 ? image.height : undefined;
  return { url, alt: title, width, height };
}

export function buildPropertyShareMetadata(property: Property, id: string): Metadata {
  const origin = portalPublicOrigin();
  const title = property.title?.trim() || 'Propiedad';
  const description = buildShareDescription(property);
  const image = pickShareImage(property);
  const pageUrl = `${origin}${propertyPublicPath(id)}`;

  return {
    title,
    description,
    metadataBase: new URL(origin),
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: 'website',
      locale: 'es_CL',
      images: image
        ? [
            {
              url: image.url,
              alt: image.alt,
              ...(image.width ? { width: image.width } : {}),
              ...(image.height ? { height: image.height } : {}),
            },
          ]
        : undefined,
    },
  };
}

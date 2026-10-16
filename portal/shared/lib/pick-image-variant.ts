/**
 * Pick the best multimedia image URL for a display context.
 * Prefers webp, then jpeg, then png; walks an ordered list of variant types.
 */

export type ImageDisplayContext = 'card' | 'detail' | 'thumb' | 'hero' | 'avatar';

export type ImageVariantLike = {
  variantType: string;
  format?: string | null;
  url?: string | null;
};

export type MultimediaLike = {
  url?: string | null;
  variants?: ImageVariantLike[] | null;
};

const CONTEXT_VARIANT_ORDER: Record<ImageDisplayContext, string[]> = {
  card: ['thumbnail_md', 'thumbnail_lg', 'thumbnail_sm', 'full'],
  detail: ['full', 'thumbnail_lg', 'thumbnail_md'],
  thumb: ['thumbnail_sm', 'thumbnail_md', 'full'],
  hero: ['slide_desktop', 'slide_tablet', 'slide_mobile', 'full'],
  avatar: ['avatar_md', 'avatar_sm', 'avatar_lg'],
};

const HERO_MOBILE_ORDER = ['slide_mobile', 'slide_tablet', 'slide_desktop'];
const HERO_DESKTOP_ORDER = ['slide_desktop', 'slide_tablet', 'slide_mobile'];

function normalizeVariantType(value?: string | null): string {
  return (value || '').trim().toLowerCase().replace(/-/g, '_');
}

function normalizeFormat(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

function findByTypeAndFormat(
  variants: ImageVariantLike[],
  type: string,
  format: string,
): ImageVariantLike | undefined {
  return variants.find((variant) => {
    const matchesType = normalizeVariantType(variant.variantType) === type;
    const matchesFormat = normalizeFormat(variant.format) === format;
    return matchesType && matchesFormat && !!variant.url;
  });
}

function pickFromOrder(
  variants: ImageVariantLike[],
  preferredTypes: string[],
): string | undefined {
  for (const type of preferredTypes) {
    const webp = findByTypeAndFormat(variants, type, 'webp');
    if (webp?.url) return webp.url;
    const jpeg = findByTypeAndFormat(variants, type, 'jpeg');
    if (jpeg?.url) return jpeg.url;
    const png = findByTypeAndFormat(variants, type, 'png');
    if (png?.url) return png.url;
  }
  return variants.find((variant) => !!variant.url)?.url ?? undefined;
}

/**
 * Resolve a single image URL for the given display context.
 * Falls back to multimedia.url when no matching variant exists.
 */
export function pickImageVariant(
  multimedia: MultimediaLike | null | undefined,
  context: ImageDisplayContext,
  fallbackUrl?: string | null,
): string | undefined {
  const variants = multimedia?.variants?.filter((v) => !!v?.url) ?? [];
  const preferred =
    context === 'hero' ? HERO_DESKTOP_ORDER : CONTEXT_VARIANT_ORDER[context];

  if (variants.length > 0) {
    const picked = pickFromOrder(variants, preferred);
    if (picked) return picked;
  }

  return multimedia?.url || fallbackUrl || undefined;
}

export type HeroImageSources = {
  mobileUrl?: string;
  desktopUrl?: string;
  /** Fallback when neither variant is available */
  fallbackUrl?: string;
};

/**
 * Resolve mobile + desktop hero URLs for `<picture>` / media sources.
 */
export function pickHeroImageSources(
  multimedia: MultimediaLike | null | undefined,
  fallbackUrl?: string | null,
): HeroImageSources {
  const variants = multimedia?.variants?.filter((v) => !!v?.url) ?? [];
  const fallback = multimedia?.url || fallbackUrl || undefined;

  if (variants.length === 0) {
    return { fallbackUrl: fallback };
  }

  const mobileUrl = pickFromOrder(variants, HERO_MOBILE_ORDER);
  const desktopUrl = pickFromOrder(variants, HERO_DESKTOP_ORDER);

  return {
    mobileUrl: mobileUrl && mobileUrl !== desktopUrl ? mobileUrl : undefined,
    desktopUrl: desktopUrl || fallback,
    fallbackUrl: fallback,
  };
}

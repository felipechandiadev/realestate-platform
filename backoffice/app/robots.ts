import type { MetadataRoute } from 'next';

/** El backoffice es interno: se pide a los buscadores que no lo rastreen. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', disallow: '/' } };
}

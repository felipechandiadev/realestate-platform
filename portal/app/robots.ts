import type { MetadataRoute } from 'next';
import { portalPublicOrigin } from '@/app/properties/property/[id]/share-metadata';

export default function robots(): MetadataRoute.Robots {
  const origin = portalPublicOrigin();
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/personalInfo',
        '/myContracts',
        '/myProperties',
        '/favorites',
        '/notifications',
        '/publish',
        '/api/',
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

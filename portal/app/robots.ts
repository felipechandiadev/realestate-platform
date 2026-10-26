import type { MetadataRoute } from 'next';
import { portalPublicOrigin } from '@/shared/lib/seo-core';

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
        '/forgot-password',
        '/reset-password',
        '/verify-email',
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}

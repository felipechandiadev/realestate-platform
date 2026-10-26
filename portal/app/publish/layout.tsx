import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/publish',
    title: 'Publica tu propiedad',
    description:
      'Envíanos los datos de tu propiedad para publicarla en venta o arriendo.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/testimonials',
    title: 'Testimonios',
    description:
      'Opiniones y experiencias de clientes que compraron, vendieron o arrendaron con nosotros.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

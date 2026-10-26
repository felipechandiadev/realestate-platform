import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/ourTeam',
    title: 'Nuestro equipo',
    description:
      'Conoce al equipo de corredores y profesionales que te acompañan en la compra, venta y arriendo de tu propiedad.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

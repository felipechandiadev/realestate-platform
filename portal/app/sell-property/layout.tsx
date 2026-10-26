import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/sell-property',
    title: 'Vende tu propiedad',
    description:
      'Publica tu propiedad en venta con nosotros: tasación, difusión y acompañamiento hasta la firma.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

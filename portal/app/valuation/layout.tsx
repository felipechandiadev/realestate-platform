import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/valuation',
    title: 'Tasa tu propiedad',
    description:
      'Solicita una tasación de tu propiedad y conoce su valor de mercado.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

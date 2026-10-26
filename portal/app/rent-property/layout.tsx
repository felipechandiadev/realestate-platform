import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/rent-property',
    title: 'Arrienda tu propiedad',
    description:
      'Arrienda tu propiedad de forma segura: publicación, evaluación de arrendatarios y contrato.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

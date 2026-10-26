import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/services/management',
    title: 'Administración de propiedades',
    description:
      'Administramos tu propiedad en arriendo: búsqueda y evaluación de arrendatarios, contratos, cobranza y mantención.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

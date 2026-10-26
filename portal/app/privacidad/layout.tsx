import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { pageMetadata } from '@/shared/lib/seo-core';

export function generateMetadata(): Metadata {
  return pageMetadata({
    path: '/privacidad',
    title: 'Política de privacidad',
    description:
      'Cómo tratamos y protegemos tus datos personales.',
  });
}

export default function Layout({ children }: { children: ReactNode }) {
  return children;
}

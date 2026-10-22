import type { Metadata } from 'next';
import PropertiesContent from '@/features/properties/components/PropertiesContent';
import { portalPublicOrigin } from '@/app/properties/property/[id]/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const origin = portalPublicOrigin();
  return {
    title: 'Propiedades',
    description: 'Listado de propiedades publicadas en venta y arriendo.',
    alternates: { canonical: `${origin}/properties` },
  };
}

export default function Page() {
  return <PropertiesContent />;
}

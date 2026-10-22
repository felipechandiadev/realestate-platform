import type { Metadata } from 'next';
import PropertiesForRentContent from '@/features/rentProperties/components/PropertiesForRentContent';
import { getPortalListingsSettings } from '@/features/cms/actions/portal-listings.action';
import OperationListingsClient from '@/app/ui/filters/OperationListingsClient';
import { portalPublicOrigin } from '@/app/properties/property/[id]/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const origin = portalPublicOrigin();
  return {
    title: 'Propiedades en Arriendo',
    description: 'Explora propiedades publicadas en arriendo.',
    alternates: { canonical: `${origin}/properties/rent` },
  };
}

export default async function Page() {
  const listings = await getPortalListingsSettings();

  return (
    <OperationListingsClient
      operation="rent"
      title="Propiedades en Arriendo"
      filterVariant={listings.listingsFilterVariant}
      classicSlot={<PropertiesForRentContent />}
    />
  );
}

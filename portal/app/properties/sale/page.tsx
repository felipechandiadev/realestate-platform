import type { Metadata } from 'next';
import PropertiesForSaleContent from '@/features/saleProperties/components/PropertiesForSaleContent';
import { getPortalListingsSettings } from '@/features/cms/actions/portal-listings.action';
import OperationListingsClient from '@/app/ui/filters/OperationListingsClient';
import { portalPublicOrigin } from '@/app/properties/property/[id]/share-metadata';

export async function generateMetadata(): Promise<Metadata> {
  const origin = portalPublicOrigin();
  return {
    title: 'Propiedades en Venta',
    description: 'Explora propiedades publicadas en venta.',
    alternates: { canonical: `${origin}/properties/sale` },
  };
}

export default async function Page() {
  const listings = await getPortalListingsSettings();

  return (
    <OperationListingsClient
      operation="sale"
      title="Propiedades en Venta"
      filterVariant={listings.listingsFilterVariant}
      classicSlot={<PropertiesForSaleContent />}
    />
  );
}

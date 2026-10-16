import PropertiesForRentContent from '@/features/rentProperties/components/PropertiesForRentContent';
import { getPortalListingsSettings } from '@/features/cms/actions/portal-listings.action';
import OperationListingsClient from '@/app/ui/filters/OperationListingsClient';

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

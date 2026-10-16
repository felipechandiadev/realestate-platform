import PropertiesForSaleContent from '@/features/saleProperties/components/PropertiesForSaleContent';
import { getPortalListingsSettings } from '@/features/cms/actions/portal-listings.action';
import OperationListingsClient from '@/app/ui/filters/OperationListingsClient';

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

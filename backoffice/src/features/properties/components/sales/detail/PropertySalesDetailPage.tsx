'use client';

import {
  PropertyDetailPage,
  type PropertyDetailHeader,
} from '@/features/properties/components/detail';

export type PropertySalesDetailHeader = PropertyDetailHeader;

type PropertySalesDetailPageProps = {
  propertyId: string;
  initialHeader: PropertySalesDetailHeader;
};

export function PropertySalesDetailPage({
  propertyId,
  initialHeader,
}: PropertySalesDetailPageProps) {
  return (
    <PropertyDetailPage
      propertyId={propertyId}
      initialHeader={initialHeader}
      listBasePath="/properties/sales"
      backAriaLabel="Volver al listado de ventas"
      testIdPrefix="property-sales-detail"
    />
  );
}

export default PropertySalesDetailPage;

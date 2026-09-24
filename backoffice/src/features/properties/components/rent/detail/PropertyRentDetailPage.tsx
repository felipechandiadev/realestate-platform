'use client';

import {
  PropertyDetailPage,
  type PropertyDetailHeader,
} from '@/features/properties/components/detail';

export type PropertyRentDetailHeader = PropertyDetailHeader;

type PropertyRentDetailPageProps = {
  propertyId: string;
  initialHeader: PropertyRentDetailHeader;
};

export function PropertyRentDetailPage({
  propertyId,
  initialHeader,
}: PropertyRentDetailPageProps) {
  return (
    <PropertyDetailPage
      propertyId={propertyId}
      initialHeader={initialHeader}
      listBasePath="/properties/rent"
      backAriaLabel="Volver al listado de arriendos"
      testIdPrefix="property-rent-detail"
    />
  );
}

export default PropertyRentDetailPage;

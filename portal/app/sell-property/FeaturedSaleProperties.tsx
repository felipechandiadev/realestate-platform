'use client';

import { useEffect, useState } from 'react';
import RelatedPropertyCard, { type RelatedProperty } from '@/app/ui/RelatedPropertyCard';
import { getPublishedFeaturedPropertiesPublic } from '@/features/shared/properties/actions/properties.action';

const MAX_CARDS = 6;

const HEADING: Record<'SALE' | 'RENT', string> = {
  SALE: 'Propiedades destacadas en venta',
  RENT: 'Propiedades destacadas en arriendo',
};

export default function FeaturedSaleProperties({
  operationType,
}: {
  operationType: 'SALE' | 'RENT';
}) {
  const [properties, setProperties] = useState<RelatedProperty[]>([]);

  useEffect(() => {
    let cancelled = false;
    getPublishedFeaturedPropertiesPublic()
      .then((result) => {
        if (cancelled || !result.success || !result.data) return;
        const listings = result.data
          .filter(
            (property) =>
              property.operationType === operationType &&
              property.isFeatured !== false &&
              (property.status === 'PUBLISHED' || !property.status),
          )
          .slice(0, MAX_CARDS)
          .map((property) => ({
            id: property.id,
            title: property.title,
            operationType,
            price: property.price,
            currencyPrice: property.currencyPrice,
            state: property.state,
            city: property.city,
            propertyType: property.propertyType
              ? { id: property.propertyType.id, name: property.propertyType.name }
              : null,
            mainImageUrl: property.mainImageUrl,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            builtSquareMeters: property.builtSquareMeters,
            parkingSpaces: property.parkingSpaces,
            isFeatured: true,
          }));
        setProperties(listings);
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      });
    return () => {
      cancelled = true;
    };
  }, [operationType]);

  if (properties.length === 0) return null;

  return (
    <section className="mt-12" data-test-id={`featured-${operationType.toLowerCase()}-properties`}>
      <h2 className="mb-6 text-2xl font-bold text-foreground">{HEADING[operationType]}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <RelatedPropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

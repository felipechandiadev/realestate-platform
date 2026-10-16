'use client';

import { useEffect, useState } from 'react';
import RelatedPropertyCard, { type RelatedProperty } from '@/app/ui/RelatedPropertyCard';
import { getPublishedFeaturedPropertiesPublic } from '@/features/shared/properties/actions/properties.action';
import { PORTAL_SKELETON } from '@/shared/components/ui/PortalSkeleton/portal-skeleton';

const MAX_CARDS = 6;

const HEADING: Record<'SALE' | 'RENT', string> = {
  SALE: 'Propiedades destacadas en venta',
  RENT: 'Propiedades destacadas en arriendo',
};

function SkeletonBar({
  className,
  color = PORTAL_SKELETON.base,
}: {
  className: string;
  color?: string;
}) {
  return <div className={`animate-pulse rounded ${className}`} style={{ backgroundColor: color }} />;
}

function FeaturedPropertySkeleton() {
  return (
    <div
      className="rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col bg-white"
      aria-hidden
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden" style={{ backgroundColor: PORTAL_SKELETON.soft }}>
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${PORTAL_SKELETON.base} 0%, ${PORTAL_SKELETON.soft} 50%, ${PORTAL_SKELETON.base} 100%)`,
          }}
        />
        <SkeletonBar className="absolute top-2 right-2 h-6 w-16 rounded-full" color={PORTAL_SKELETON.mid} />
      </div>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <SkeletonBar className="h-3 w-20" />
        <SkeletonBar className="h-4 w-4/5" color={PORTAL_SKELETON.mid} />
        <SkeletonBar className="h-4 w-3/5" />
        <SkeletonBar className="h-3 w-1/2" color={PORTAL_SKELETON.soft} />
        <div className="mt-1 flex items-center gap-3">
          <SkeletonBar className="h-3 w-8" />
          <SkeletonBar className="h-3 w-8" />
          <SkeletonBar className="h-3 w-12" />
        </div>
        <div className="mt-auto pt-2 border-t border-gray-100">
          <SkeletonBar className="h-6 w-28" color={PORTAL_SKELETON.mid} />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedSaleProperties({
  operationType,
}: {
  operationType: 'SALE' | 'RENT';
}) {
  const [properties, setProperties] = useState<RelatedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPublishedFeaturedPropertiesPublic()
      .then((result) => {
        if (cancelled) return;
        if (!result.success || !result.data) {
          setProperties([]);
          return;
        }
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
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [operationType]);

  if (!loading && properties.length === 0) return null;

  return (
    <section
      className="mt-12"
      data-test-id={`featured-${operationType.toLowerCase()}-properties`}
      aria-busy={loading}
    >
      <h2 className="mb-6 text-2xl font-bold text-foreground">{HEADING[operationType]}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: MAX_CARDS }, (_, index) => (
              <FeaturedPropertySkeleton key={index} />
            ))
          : properties.map((property) => (
              <RelatedPropertyCard key={property.id} property={property} />
            ))}
      </div>
    </section>
  );
}

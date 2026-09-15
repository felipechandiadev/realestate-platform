'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bed, Bath, Home, ImageOff } from 'lucide-react';

export interface FeaturedProperty {
  id: string;
  title: string;
  city?: string | null;
  state?: string | null;
  price: number;
  currencyPrice: 'CLP' | 'UF';
  operationType: 'SALE' | 'RENT';
  mainImageUrl?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  builtSquareMeters?: number | null;
  isFeatured?: boolean;
}

interface FeaturedPropertyCardProps {
  property: FeaturedProperty;
  /** Clone del marquee: no enfocable / oculto a SR */
  inertClone?: boolean;
  /** Eager load for above-the-fold marquee cards */
  priorityImage?: boolean;
}

const formatPrice = (value: number, currency: string) => {
  if (currency === 'UF') {
    return `${value.toFixed(2)} UF`;
  }
  return value.toLocaleString('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  });
};

export default function FeaturedPropertyCard({
  property,
  inertClone = false,
  priorityImage = false,
}: FeaturedPropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const locationParts = [property.city, property.state].filter(Boolean);
  const operationLabel = property.operationType === 'SALE' ? 'En Venta' : 'En Arriendo';
  const priceLabel = formatPrice(property.price, property.currencyPrice);
  const ariaLabel = `${property.title}. ${operationLabel}. ${priceLabel}`;

  const cardInner = (
    <>
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {property.mainImageUrl && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={property.mainImageUrl}
            alt={inertClone ? '' : property.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading={priorityImage ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff size={28} aria-hidden />
          </div>
        )}

        {property.isFeatured ? (
          <span
            className="absolute left-2 top-2 z-10 rounded-md bg-success px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm"
            data-test-id="property-card-featured"
          >
            Destacada
          </span>
        ) : null}

        <div className="absolute right-2 top-2 z-10">
          <span
            className="rounded-full border-2 border-white bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-lg"
            data-test-id="property-card-operation"
          >
            {operationLabel}
          </span>
        </div>
      </div>

      <div className="flex min-h-[7.5rem] flex-1 flex-col gap-2 bg-card p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground">{property.title}</h3>

        {property.bedrooms || property.bathrooms || property.builtSquareMeters ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {property.bedrooms ? (
              <div className="flex items-center gap-1">
                <Bed size={18} className="text-primary" aria-hidden />
                <span>{property.bedrooms}</span>
              </div>
            ) : null}
            {property.bathrooms ? (
              <div className="flex items-center gap-1">
                <Bath size={18} className="text-primary" aria-hidden />
                <span>{property.bathrooms}</span>
              </div>
            ) : null}
            {property.builtSquareMeters ? (
              <div className="flex items-center gap-1">
                <Home size={18} className="text-primary" aria-hidden />
                <span>{Math.round(property.builtSquareMeters)} m²</span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-0">
          <span className="text-base font-bold text-primary">{priceLabel}</span>
          <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
            {locationParts.join(' · ') || 'Chile'}
          </span>
        </div>
      </div>
    </>
  );

  const shellClassName =
    'group flex h-full w-56 flex-shrink-0 flex-col overflow-hidden rounded-[20px] border border-border/70 bg-transparent shadow-sm transition-[box-shadow,transform] duration-300 ease-out hover:shadow-md sm:w-64 lg:w-72';

  if (inertClone) {
    return (
      <div className={shellClassName} aria-hidden="true">
        {cardInner}
      </div>
    );
  }

  return (
    <Link
      href={`/properties/property/${property.id}`}
      className={shellClassName}
      aria-label={ariaLabel}
      data-test-id={`featured-property-card-${property.id}`}
    >
      {cardInner}
    </Link>
  );
}

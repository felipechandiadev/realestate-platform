"use client";

import React, { useState } from 'react';
import { Bed, Bath, Home } from 'lucide-react';

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
}

const formatPrice = (value: number, currency: string) => {
  if (currency === 'UF') {
    return `${value.toFixed(2)} UF`;
  }
  return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
};

export default function FeaturedPropertyCard({ property }: FeaturedPropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  const locationParts = [property.city, property.state].filter(Boolean);

  const handleClick = () => {
    window.open(`/portal/properties/property/${property.id}`, '_blank');
  };

  return (
    <div className="snap-start w-56 sm:w-64 lg:w-72 flex-shrink-0 h-full">
      <article
        onClick={handleClick}
        className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border/70 transition-transform duration-300 ease-out hover:-translate-y-1 cursor-pointer select-none"
        style={{ backgroundColor: 'transparent' }}
      >
        <div 
          className="relative aspect-video w-full overflow-hidden bg-white"
        >
          {property.mainImageUrl && !imageError ? (
            <img
              src={property.mainImageUrl}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full" />
          )}

          {property.isFeatured && (
            <div
              className="absolute left-0 top-0 z-10 bg-success text-white font-bold text-[0.5rem] py-[0.2rem] px-6 shadow-md"
              style={{
                transformOrigin: '0% 0%',
                transform: 'translate(-20%, 270%) rotate(-45deg)',
                pointerEvents: 'none',
              }}
              data-test-id="property-card-featured"
            >
              DESTACADA
            </div>
          )}

          <div className="absolute top-2 right-2 z-10">
            <span
              className="bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full border-2 border-white shadow-lg"
              data-test-id="property-card-operation"
            >
              {property.operationType === 'SALE' ? 'En Venta' : 'En Arriendo'}
            </span>
          </div>
        </div>

          <div className="flex flex-1 flex-col gap-2 p-3 min-h-0 bg-card">
            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                {property.title}
              </h3>
            </div>

            {/* Stats: dormitorios, baños, m² */}
            {(property.bedrooms || property.bathrooms || property.builtSquareMeters) && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {property.bedrooms ? (
                  <div className="flex items-center gap-1">
                    <Bed size={20} className="text-primary" />
                    <span>{property.bedrooms}</span>
                  </div>
                ) : null}
                {property.bathrooms ? (
                  <div className="flex items-center gap-1">
                    <Bath size={20} className="text-primary" />
                    <span>{property.bathrooms}</span>
                  </div>
                ) : null}
                {property.builtSquareMeters ? (
                  <div className="flex items-center gap-1">
                    <Home size={20} className="text-primary" />
                    <span>{Math.round(property.builtSquareMeters)} m²</span>
                  </div>
                ) : null}
              </div>
            )}

            <div className="mt-auto flex flex-col gap-0">
              <span className="text-base font-bold text-primary">{formatPrice(property.price, property.currencyPrice)}</span>
              <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {locationParts.join(' · ') || 'Chile'}
              </span>
            </div>
          </div>

      </article>
    </div>
  );
}
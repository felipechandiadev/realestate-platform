'use client';

import React from 'react';
import { env } from '@/lib/env';
import Link from 'next/link';

type Currency = 'CLP' | 'UF';
type OperationType = 'SALE' | 'RENT';

type MediaItem = {
  id?: string;
  url: string;
  type?: string;
  format?: string;
};

type PropertyTypeLite = {
  id: string;
  name: string;
};

export interface RelatedProperty {
  id: string;
  title: string;
  operationType: OperationType;
  price: number;
  currencyPrice: Currency;
  state?: string | null;
  city?: string | null;
  propertyType?: PropertyTypeLite | null;
  mainImageUrl?: string | null;
  multimedia?: MediaItem[];
  bedrooms?: number | null;
  bathrooms?: number | null;
  builtSquareMeters?: number | null;
  parkingSpaces?: number | null;
}

interface RelatedPropertyCardProps {
  property: RelatedProperty;
}

const FALLBACK_IMAGE_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" text-anchor="middle" font-size="24" fill="#9ca3af">Sin imagen</text>
    </svg>`
  );

function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;

  const cleaned = url.replace('/../', '/');

  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    if (cleaned.includes('localhost:3000') || cleaned.includes('127.0.0.1:3000')) {
      return cleaned.replace(/https?:\/\/[^\/]+/, env.backendApiUrl);
    }
    return cleaned;
  }

  if (cleaned.startsWith('/')) {
    return `${env.backendApiUrl}${cleaned}`;
  }

  return cleaned;
}

function formatPrice(price: number, currency: Currency): string {
  if (currency === 'UF') {
    return `UF ${price.toLocaleString('es-CL')}`;
  }
  return `$${price.toLocaleString('es-CL')}`;
}

function getMainImage(property: RelatedProperty): string {
  // Try mainImageUrl first
  if (property.mainImageUrl) {
    const normalized = normalizeMediaUrl(property.mainImageUrl);
    if (normalized) return normalized;
  }

  // Try first image from multimedia
  if (property.multimedia && property.multimedia.length > 0) {
    const firstImage = property.multimedia.find(
      (m) => m.type === 'PROPERTY_IMG' || m.format === 'IMG'
    );
    if (firstImage) {
      const normalized = normalizeMediaUrl(firstImage.url);
      if (normalized) return normalized;
    }
  }

  return FALLBACK_IMAGE_DATA_URL;
}

export default function RelatedPropertyCard({ property }: RelatedPropertyCardProps) {
  const imageUrl = getMainImage(property);
  const location = [property.city, property.state].filter(Boolean).join(', ');

  return (
    <Link
      href={`/portal/properties/property/${property.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== FALLBACK_IMAGE_DATA_URL) {
                target.src = FALLBACK_IMAGE_DATA_URL;
              }
            }}
          />
          
          {/* Operation badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${
                property.operationType === 'SALE'
                  ? 'bg-blue-500 text-white'
                  : 'bg-green-500 text-white'
              }`}
            >
              {property.operationType === 'SALE' ? 'Venta' : 'Arriendo'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          {/* Property type */}
          <div className="text-xs text-muted-foreground font-medium">
            {property.propertyType?.name || 'Propiedad'}
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="material-symbols-outlined text-sm">location_on</span>
              <span className="line-clamp-1">{location}</span>
            </div>
          )}

          {/* Characteristics */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            {property.bedrooms !== null && property.bedrooms !== undefined && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">bed</span>
                <span>{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms !== null && property.bathrooms !== undefined && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">bathtub</span>
                <span>{property.bathrooms}</span>
              </div>
            )}
            {property.builtSquareMeters !== null && property.builtSquareMeters !== undefined && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">straighten</span>
                <span>{property.builtSquareMeters} m²</span>
              </div>
            )}
            {property.parkingSpaces !== null && property.parkingSpaces !== undefined && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">local_parking</span>
                <span>{property.parkingSpaces}</span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="mt-auto pt-2 border-t border-border">
            <div className="text-lg font-bold text-primary">
              {formatPrice(property.price, property.currencyPrice)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

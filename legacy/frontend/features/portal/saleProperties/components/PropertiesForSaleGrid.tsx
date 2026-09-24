'use client';

import React, { useMemo } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import PropertyCard, { type PortalProperty } from '@/app/portal/ui/PropertyCard';
import PropertyCardSkeleton from '@/shared/components/ui/PropertyCardSkeleton/PropertyCardSkeleton';

interface PropertyVariant {
  id?: string;
  variantType: string;
  format: 'webp' | 'jpeg' | 'png';
  width: number;
  height: number;
  size: number;
  url: string;
}

interface PropertyMultimediaItem {
  id: string;
  url: string;
  filename?: string;
  type?: string;
  format?: string;
  variants?: PropertyVariant[];
}

interface PropertyForSale {
  id: string;
  title: string;
  description?: string;
  price: number;
  mainImageUrl?: string;
  thumbnail?: string;
  images?: string[];
  multimedia?: PropertyMultimediaItem[];
  operationType?: 'SALE' | 'RENT';
  currency?: 'CLP' | 'UF';
  location?: {
    address?: string;
    city?: string;
    state?: string;
  };
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    totalArea?: number;
  };
  // Direct property fields (from backend entity)
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  builtSquareMeters?: number;
  landSquareMeters?: number;
  state?: string;
  city?: string;
  propertyType?: { id: string; name: string } | null;
  isFeatured?: boolean;
}

interface PropertiesForSaleGridProps {
  properties: PropertyForSale[];
  isLoading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * PropertiesForSaleGrid component
 * 
 * Displays properties available for sale in a responsive grid layout.
 * Uses the same PropertyCard component as the main portal for consistent UX.
 * Features media gallery, favorites, and rich property details.
 * Supports pagination for browsing through available properties.
 * 
 * @param {PropertyForSale[]} properties - Array of sale properties
 * @param {boolean} isLoading - Loading state indicator
 * @param {string} error - Error message if any
 * @param {number} total - Total number of properties
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {Function} onPageChange - Callback when page changes
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesForSaleGrid({
  properties,
  isLoading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 9,
  onPageChange,
  className = '',
}: PropertiesForSaleGridProps) {
  const totalPages = Math.ceil(total / pageSize);

  // Map PropertyForSale to PortalProperty for PropertyCard component
  const mappedProperties = useMemo(() => {
    return properties.map((property): PortalProperty => ({
      id: property.id,
      title: property.title,
      description: property.description || null,
      price: property.price,
      currencyPrice: (property.currency as 'CLP' | 'UF') || 'CLP',
      operationType: 'SALE',
      state: property.state || property.location?.state || null,
      city: property.city || property.location?.city || null,
      mainImageUrl: property.mainImageUrl || null,
      multimedia: property.multimedia || [],
      bedrooms: property.bedrooms || property.features?.bedrooms || null,
      bathrooms: property.bathrooms || property.features?.bathrooms || null,
      builtSquareMeters: property.builtSquareMeters || property.features?.totalArea || null,
      landSquareMeters: property.landSquareMeters || null,
      parkingSpaces: property.parkingSpaces || property.features?.parkingSpaces || null,
      propertyType: property.propertyType || null,
      isFeatured: property.isFeatured || false,
    }));
  }, [properties]);

  if (isLoading) {
    return (
      <div className={`properties-for-sale-grid ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No se encontraron propiedades en venta</p>
      </div>
    );
  }

  return (
    <div className={`properties-for-sale-grid ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mappedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8 p-4">
          {/* Botón Anterior */}
          {page > 1 && (
            <Button
              variant="outlined"
              onClick={() => onPageChange?.(page - 1)}
              className="px-3 py-2 text-sm"
            >
              ← Anterior
            </Button>
          )}

          {/* Números de página */}
          {Array.from({ length: totalPages }, (_, i) => {
            const pageNum = i + 1;
            const maxVisible = 5;
            let start = Math.max(1, page - Math.floor(maxVisible / 2));
            let end = Math.min(totalPages, start + maxVisible - 1);

            // Ajustar si estamos cerca del final
            if (end - start + 1 < maxVisible) {
              start = Math.max(1, end - maxVisible + 1);
            }

            return pageNum >= start && pageNum <= end ? pageNum : null;
          })
            .filter(Boolean)
            .map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => onPageChange?.(pageNum as number)}
                className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                  pageNum === page
                    ? 'bg-primary text-background font-medium'
                    : 'text-foreground hover:bg-accent hover:text-background'
                }`}
              >
                {pageNum}
              </button>
            ))}

          {/* Botón Siguiente */}
          {page < totalPages && (
            <Button
              variant="outlined"
              onClick={() => onPageChange?.(page + 1)}
              className="px-3 py-2 text-sm"
            >
              Siguiente →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

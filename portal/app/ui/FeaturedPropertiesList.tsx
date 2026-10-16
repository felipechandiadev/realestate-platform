'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropertyCard, { PortalProperty } from './PropertyCard';
import { Button } from '@realestate/ui';
import { getPublishedFeaturedProperties } from '@/features/shared/properties/actions/properties.action';

interface PropertyFromAPI {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: 'CLP' | 'UF';
  operationType: 'RENT' | 'SALE';
  state?: string;
  city?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  totalArea?: number | null;
  builtSquareMeters?: number | null;
  landSquareMeters?: number | null;
  parkingSpaces?: number | null;
  mainImageUrl?: string;
  isFeatured: boolean;
  multimedia?: {
    id?: string;
    url: string;
    type?: string;
    format?: string;
  }[];
  propertyType?: {
    id: string;
    name: string;
    hasBedrooms?: boolean;
    hasBathrooms?: boolean;
    hasBuiltSquareMeters?: boolean;
    hasLandSquareMeters?: boolean;
    hasParkingSpaces?: boolean;
    hasFloors?: boolean;
    hasConstructionYear?: boolean;
  };
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface FeaturedPropertiesListProps {
  properties: PropertyFromAPI[];
  pagination?: PaginationData;
  isLoading?: boolean;
  /** Desktop grid columns (1–4) */
  columns?: number;
}

const COL_CLASS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

const PaginationControls: React.FC<{
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}> = ({ pagination, onPageChange, isLoading = false }) => {
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

  // Generar números de página a mostrar (máximo 5, centrados en la página actual)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    // Ajustar si estamos cerca del final
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (!isLoading) {
      onPageChange(newPage);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-8">
      {/* Botón Anterior */}
      {hasPrevPage && (
        <Button
          variant="outlined"
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-2 text-sm"
          disabled={isLoading}
        >
          ← Anterior
        </Button>
      )}

      {/* Números de página */}
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => handlePageChange(pageNum)}
          disabled={isLoading}
          className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
            pageNum === page
              ? 'bg-primary text-background font-medium'
              : 'text-foreground hover:bg-accent hover:text-background disabled:opacity-50'
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* Botón Siguiente */}
      {hasNextPage && (
        <Button
          variant="outlined"
          onClick={() => handlePageChange(page + 1)}
          className="px-3 py-2 text-sm"
          disabled={isLoading}
        >
          Siguiente →
        </Button>
      )}
    </div>
  );
};

export default function FeaturedPropertiesList({
  properties,
  pagination,
  isLoading: initialIsLoading = false,
  columns = 3,
}: FeaturedPropertiesListProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(initialIsLoading);
  const colClass = COL_CLASS[Math.min(4, Math.max(1, columns))] ?? COL_CLASS[3];

  const handlePageChange = useCallback(async (newPage: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      params.set('featured_page', newPage.toString());
      router.push(`?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error('Error changing featured page:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <div className="w-full relative z-0">
      <div
        className={`grid grid-cols-1 gap-6 transition-opacity duration-200 ${colClass} ${
          isLoading ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {properties.map((property) => {
          // Mapear los campos de la API a la interfaz que PropertyCard espera
          const mappedProperty: PortalProperty = {
            id: property.id,
            title: property.title,
            description: property.description || null,
            operationType: (property.operationType === 'SALE' ? 'SALE' : 'RENT') as any,
            price: property.price,
            currencyPrice: property.currency || 'CLP',
            state: property.state || null,
            city: property.city || null,
            propertyType: property.propertyType,
            mainImageUrl: property.mainImageUrl || null,
            multimedia: property.multimedia || [],
            bedrooms: property.bedrooms || null,
            bathrooms: property.bathrooms || null,
            builtSquareMeters: property.builtSquareMeters ?? property.totalArea ?? null,
            landSquareMeters: property.landSquareMeters ?? null,
            parkingSpaces: property.parkingSpaces ?? null,
            otherFeatures: Array.isArray((property as { otherFeatures?: string[] }).otherFeatures)
              ? (property as { otherFeatures?: string[] }).otherFeatures
              : [],
            isFeatured: property.isFeatured,
          };

          return <PropertyCard key={property.id} property={mappedProperty} />;
        })}
      </div>

      {/* Controles de paginación */}
      {pagination && (
        <PaginationControls 
          pagination={pagination} 
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

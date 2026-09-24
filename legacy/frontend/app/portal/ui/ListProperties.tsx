'use client';

import React, { useEffect, useRef } from 'react';
import PropertyCard, { PortalProperty } from './PropertyCard';
import { Button } from '@/shared/components/ui/Button/Button';

interface PropertyFromAPI {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  operationType: string;
  state: string;
  city: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  totalArea?: number | null;
  builtSquareMeters?: number | null;
  landSquareMeters?: number | null;
  parkingSpaces?: number | null;
  mainImageUrl: string;
  multimedia?: Array<{
    id: string;
    url: string;
    type?: string;
    format?: string;
  }>;
  createdAt: string;
  isFeatured?: boolean;
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

interface ListPropertiesProps {
  properties: PropertyFromAPI[];
  pagination?: PaginationData;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

const PaginationControls: React.FC<{
  pagination: PaginationData;
  onPageChange?: (page: number) => void;
}> = ({ pagination, onPageChange }) => {
  // Asegurar valores por defecto si faltan
  const {
    page = 1,
    totalPages = 1,
    hasPrevPage = false,
    hasNextPage = false
  } = pagination || {};

  console.log('🔍 [PaginationControls] Debug:', { totalPages, page, hasPrevPage, hasNextPage });
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
    if (onPageChange) {
      onPageChange(newPage);
    }
  };

  console.log('🔍 [PaginationControls] Debug:', { totalPages, page, hasPrevPage, hasNextPage });

  // Siempre renderizar, incluso con 1 página (para consistencia visual)
  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center space-x-2 mt-8 p-4 border-t border-gray-200">
      {/* Botón Anterior */}
      {hasPrevPage && (
        <Button
          variant="outlined"
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-2 text-sm"
        >
          ← Anterior
        </Button>
      )}

      {/* Números de página */}
      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => handlePageChange(pageNum)}
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
      {hasNextPage && (
        <Button
          variant="outlined"
          onClick={() => handlePageChange(page + 1)}
          className="px-3 py-2 text-sm"
        >
          Siguiente →
        </Button>
      )}
    </div>
  );
};

export default function ListProperties({ properties, pagination, onPageChange, isLoading = false }: ListPropertiesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentPage = pagination?.page;
  const SCROLL_OFFSET = 300;
  const previousPageRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (typeof currentPage !== 'number') {
      return;
    }

    if (!isInitializedRef.current) {
      previousPageRef.current = currentPage;
      isInitializedRef.current = true;
      return;
    }

    if (isLoading || previousPageRef.current === currentPage) {
      return;
    }

    if (containerRef.current && typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) {
          return;
        }

        const absoluteTop = rect.top + window.scrollY;
        const target = Math.max(absoluteTop - SCROLL_OFFSET, 0);
        window.scrollTo({ top: target, behavior: 'smooth' });
      });
    }

    previousPageRef.current = currentPage;
  }, [currentPage, isLoading]);

  return (
    <div ref={containerRef} className="w-full relative z-0 scroll-mt-24">
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
        {properties.map((property) => {
          // Mapear los campos de la API a la interfaz que PropertyCard espera
          const mappedProperty: PortalProperty = {
            id: property.id,
            title: property.title,
            description: property.description || null,
            operationType: (property.operationType === 'SALE' ? 'SALE' : 'RENT') as any,
            price: property.price,
            currencyPrice: (property.currency as 'CLP' | 'UF') || 'CLP',
            state: property.state,
            city: property.city,
            propertyType: property.propertyType,
            mainImageUrl: property.mainImageUrl || null,
            multimedia: property.multimedia || [],
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            builtSquareMeters: property.builtSquareMeters ?? property.totalArea ?? null,
            landSquareMeters: property.landSquareMeters ?? null,
            parkingSpaces: property.parkingSpaces ?? null,
            isFeatured: property.isFeatured || false,
          };

          return <PropertyCard key={property.id} property={mappedProperty} />;
        })}
      </div>

      {/* Controles de paginación minimalistas */}
      {pagination && <PaginationControls pagination={pagination} onPageChange={onPageChange} />}
    </div>
  );
}

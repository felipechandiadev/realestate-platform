'use client';

import React, { useEffect, useRef } from 'react';
import PropertyCard, { PortalProperty } from './PropertyCard';
import { Button } from '@realestate/ui';

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
  otherFeatures?: string[];
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

export interface PaginationData {
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
  /** When false, parent can render pagination full-width below sidebar+grid */
  showPagination?: boolean;
}

export function PropertyPaginationControls({
  pagination,
  onPageChange,
}: {
  pagination: PaginationData;
  onPageChange?: (page: number) => void;
}) {
  const {
    page = 1,
    totalPages = 1,
    hasPrevPage = false,
    hasNextPage = false,
  } = pagination || {};

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    onPageChange?.(newPage);
  };

  return (
    <div className="flex items-center justify-center space-x-2 p-4">
      {hasPrevPage && (
        <Button
          variant="outlined"
          onClick={() => handlePageChange(page - 1)}
          className="px-3 py-2 text-sm"
        >
          ← Anterior
        </Button>
      )}

      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          onClick={() => handlePageChange(pageNum)}
          className={`rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
            pageNum === page
              ? 'bg-primary font-medium text-background'
              : 'text-foreground hover:bg-accent hover:text-background'
          }`}
        >
          {pageNum}
        </button>
      ))}

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
}

export default function ListProperties({
  properties,
  pagination,
  onPageChange,
  isLoading = false,
  showPagination = true,
}: ListPropertiesProps) {
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
    <div ref={containerRef} className="relative z-0 w-full scroll-mt-24">
      <div
        className={`grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-3 ${
          isLoading ? 'opacity-70' : 'opacity-100'
        }`}
      >
        {properties.map((property) => {
          const mappedProperty: PortalProperty = {
            id: property.id,
            title: property.title,
            description: property.description || null,
            operationType: property.operationType === 'SALE' ? 'SALE' : 'RENT',
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
            otherFeatures: Array.isArray(property.otherFeatures) ? property.otherFeatures : [],
            isFeatured: property.isFeatured || false,
          };

          return <PropertyCard key={property.id} property={mappedProperty} />;
        })}
      </div>

      {showPagination && pagination ? (
        <div className="mt-8 border-t border-border">
          <PropertyPaginationControls pagination={pagination} onPageChange={onPageChange} />
        </div>
      ) : null}
    </div>
  );
}

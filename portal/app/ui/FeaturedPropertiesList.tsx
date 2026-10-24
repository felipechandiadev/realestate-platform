'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@realestate/ui';
import FeaturedPropertyCard, { FeaturedProperty } from './FeaturedPropertyCard';
import { pickImageVariant } from '@/shared/lib/pick-image-variant';

interface PropertyFromAPI {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: 'CLP' | 'UF';
  currencyPrice?: 'CLP' | 'UF';
  operationType: 'RENT' | 'SALE';
  state?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  builtSquareMeters?: number | null;
  totalArea?: number | null;
  mainImageUrl?: string;
  isFeatured?: boolean;
  otherFeatures?: string[];
  multimedia?: Array<{
    id?: string;
    url: string;
    type?: string;
    format?: string;
    variants?: Array<{
      variantType: string;
      format?: string;
      url?: string;
    }>;
  }>;
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


function mapToFeaturedProperty(property: PropertyFromAPI): FeaturedProperty {
  const mediaItems = property.multimedia || [];
  const imageMedia =
    mediaItems.find((item) => (item.type || '').toUpperCase() === 'PROPERTY_IMG') ||
    mediaItems.find((item) => (item.format || '').toUpperCase() === 'IMG') ||
    mediaItems[0];

  const mainImageUrl = imageMedia
    ? pickImageVariant(imageMedia, 'card', imageMedia.url || property.mainImageUrl) ??
      property.mainImageUrl ??
      null
    : property.mainImageUrl ?? null;

  return {
    id: property.id,
    title: property.title,
    description: property.description ?? null,
    price: property.price,
    currencyPrice: property.currencyPrice ?? property.currency ?? 'CLP',
    operationType: property.operationType === 'SALE' ? 'SALE' : 'RENT',
    mainImageUrl,
    city: property.city ?? null,
    state: property.state ?? null,
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    builtSquareMeters: property.builtSquareMeters ?? property.totalArea ?? null,
    otherFeatures: Array.isArray(property.otherFeatures) ? property.otherFeatures : [],
    isFeatured: true,
  };
}

const PaginationControls: React.FC<{
  pagination: PaginationData;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}> = ({ pagination, onPageChange, isLoading = false }) => {
  const { page, totalPages, hasPrevPage, hasNextPage } = pagination;

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
    if (!isLoading) {
      onPageChange(newPage);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center space-x-2">
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

      {getPageNumbers().map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          onClick={() => handlePageChange(pageNum)}
          disabled={isLoading}
          className={`rounded-md px-3 py-2 text-sm transition-colors duration-200 ${
            pageNum === page
              ? 'bg-primary font-medium text-background'
              : 'text-foreground hover:bg-accent hover:text-background disabled:opacity-50'
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
  const cols = Math.min(4, Math.max(1, columns));

  const featuredProperties = useMemo(
    () => properties.map(mapToFeaturedProperty),
    [properties],
  );

  const handlePageChange = useCallback(
    async (newPage: number) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams(
          typeof window !== 'undefined' ? window.location.search : '',
        );
        params.set('featured_page', newPage.toString());
        router.push(`?${params.toString()}`, { scroll: false });
      } catch (error) {
        console.error('Error changing featured page:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  return (
    <div className="relative z-0 w-full">
      <div
        className={`mx-auto grid justify-center gap-5 transition-opacity duration-200 ${
          isLoading ? 'opacity-70' : 'opacity-100'
        }`}
        style={{
          // Columns sized to the carousel card (~18rem) so gap-x is the real horizontal separation
          gridTemplateColumns: `repeat(${cols}, minmax(0, 18rem))`,
        }}
      >
        {featuredProperties.map((property, index) => (
          <FeaturedPropertyCard
            key={property.id}
            property={property}
            layout="grid"
            priorityImage={index < 4}
          />
        ))}
      </div>

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

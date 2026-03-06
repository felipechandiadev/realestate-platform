'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import LazyImage from '@/shared/components/ui/LazyImage';
import type { Property } from '@/features/portal/properties/types';

interface PropertiesGridProps {
  properties: Property[];
  isLoading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * PropertiesGrid component
 * 
 * Displays properties in a responsive grid layout with card-based design.
 * Shows property image, title, price, location, and key features.
 * Supports pagination and lazy loading.
 * 
 * @param {Property[]} properties - Array of properties to display
 * @param {boolean} isLoading - Loading state indicator
 * @param {string} error - Error message if any
 * @param {number} total - Total number of properties
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {Function} onPageChange - Callback when page changes
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesGrid({
  properties,
  isLoading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 9,
  onPageChange,
  className = '',
}: PropertiesGridProps) {
  const totalPages = Math.ceil(total / pageSize);

  const buildImageMultimedia = (property: Property) => {
    const mediaAwareProperty = property as Property & {
      multimedia?: any;
      mainImageUrl?: string;
      thumbnail?: string;
      images?: string[];
    };

    const rawMultimedia = mediaAwareProperty.multimedia;
    const selectedMultimedia = Array.isArray(rawMultimedia)
      ? rawMultimedia.find((item: any) => item?.type === 'PROPERTY_IMG') ||
        rawMultimedia.find((item: any) => item?.format === 'IMG') ||
        rawMultimedia[0]
      : rawMultimedia;

    return {
      id: selectedMultimedia?.id || property.id,
      url:
        selectedMultimedia?.url ||
        mediaAwareProperty.mainImageUrl ||
        mediaAwareProperty.thumbnail ||
        mediaAwareProperty.images?.[0] ||
        '/placeholder-property.jpg',
      filename: selectedMultimedia?.filename || 'property-image.jpg',
      variants: selectedMultimedia?.variants || [],
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="flex justify-center"><span className="material-symbols-outlined animate-spin">progress_activity</span></div>
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
        <p className="text-gray-500 text-lg">No se encontraron propiedades</p>
      </div>
    );
  }

  return (
    <div className={`properties-grid ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/portal/properties/${property.id}`}
            className="block transition-transform hover:scale-105"
          >
            <Card className="h-full overflow-hidden">
              <div className="relative w-full bg-neutral">
                <LazyImage
                  multimedia={buildImageMultimedia(property)}
                  variantType="thumbnail-md"
                  alt={property.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-48 object-cover"
                  containerClassName="relative w-full"
                  maintainAspectRatio={false}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  ${property.price.toLocaleString('es-CL')}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {property.location?.address || 'Ubicación no especificada'}
                </p>
                <div className="flex gap-4 text-sm text-gray-600">
                  {property.features?.bedrooms > 0 && (
                    <span className="flex items-center gap-1">
                      🛏️ {property.features.bedrooms}
                    </span>
                  )}
                  {property.features?.bathrooms > 0 && (
                    <span className="flex items-center gap-1">
                      🚿 {property.features.bathrooms}
                    </span>
                  )}
                  {property.features?.parkingSpaces > 0 && (
                    <span className="flex items-center gap-1">
                      🚗 {property.features.parkingSpaces}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <Button
            variant="outlined"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-gray-600 px-4">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outlined"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
}

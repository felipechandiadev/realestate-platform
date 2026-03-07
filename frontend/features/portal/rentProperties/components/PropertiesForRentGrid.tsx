'use client';

import React from 'react';
import Link from 'next/link';
import Card from '@/shared/components/ui/Card/Card';
import { Button } from '@/shared/components/ui/Button/Button';
import LazyImage from '@/shared/components/ui/LazyImage';

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

interface PropertyForRent {
  id: string;
  title: string;
  description?: string;
  price: number;
  mainImageUrl?: string;
  thumbnail?: string;
  images?: string[];
  multimedia?: PropertyMultimediaItem[];
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
  state?: string;
  city?: string;
}

interface PropertiesForRentGridProps {
  properties: PropertyForRent[];
  isLoading?: boolean;
  error?: string | null;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

/**
 * PropertiesForRentGrid component
 * 
 * Displays properties available for rent in a responsive grid layout.
 * Features card-based design with property images, rental pricing, and amenities.
 * Supports pagination for browsing through rental listings.
 * 
 * @param {PropertyForRent[]} properties - Array of rental properties
 * @param {boolean} isLoading - Loading state indicator
 * @param {string} error - Error message if any
 * @param {number} total - Total number of properties
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @param {Function} onPageChange - Callback when page changes
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesForRentGrid({
  properties,
  isLoading = false,
  error = null,
  total = 0,
  page = 1,
  pageSize = 9,
  onPageChange,
  className = '',
}: PropertiesForRentGridProps) {
  const totalPages = Math.ceil(total / pageSize);

  const buildImageMultimedia = (property: PropertyForRent) => {
    const selectedMultimedia =
      property.multimedia?.find((item) => item.type === 'PROPERTY_IMG') ||
      property.multimedia?.find((item) => item.format === 'IMG') ||
      property.multimedia?.[0];

    return {
      id: selectedMultimedia?.id || property.id,
      url:
        selectedMultimedia?.url ||
        property.mainImageUrl ||
        property.thumbnail ||
        property.images?.[0] ||
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
        <p className="text-gray-500 text-lg">No se encontraron propiedades en arriendo</p>
      </div>
    );
  }

  return (
    <div className={`properties-for-rent-grid ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Link
            key={property.id}
            href={`/portal/properties/rent/${property.id}`}
            className="block transition-transform hover:scale-105"
          >
            <Card className="h-full overflow-hidden">
              <div className="relative h-48 w-full">
                <LazyImage
                  multimedia={buildImageMultimedia(property)}
                  variantType="thumbnail-md"
                  alt={property.title}
                  className="w-full h-48 object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  containerClassName="relative w-full h-48"
                  maintainAspectRatio={false}
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Arriendo
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-2xl font-bold text-primary mb-2">
                  ${property.price.toLocaleString('es-CL')}/mes
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {property.location?.address || 'Ubicación no especificada'}
                </p>
                <div className="flex gap-4 text-sm text-gray-600">
                  {(property.bedrooms || property.features?.bedrooms) && (property.bedrooms || property.features?.bedrooms) > 0 && (
                    <span className="flex items-center gap-1">
                      🛏️ {property.bedrooms || property.features?.bedrooms}
                    </span>
                  )}
                  {(property.bathrooms || property.features?.bathrooms) && (property.bathrooms || property.features?.bathrooms) > 0 && (
                    <span className="flex items-center gap-1">
                      🚿 {property.bathrooms || property.features?.bathrooms}
                    </span>
                  )}
                  {(property.parkingSpaces || property.features?.parkingSpaces) && (property.parkingSpaces || property.features?.parkingSpaces) > 0 && (
                    <span className="flex items-center gap-1">
                      🚗 {property.parkingSpaces || property.features?.parkingSpaces}
                    </span>
                  )}
                  {(property.builtSquareMeters || property.features?.totalArea) && (property.builtSquareMeters || property.features?.totalArea) > 0 && (
                    <span className="flex items-center gap-1">
                      📐 {property.builtSquareMeters || property.features?.totalArea}m²
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

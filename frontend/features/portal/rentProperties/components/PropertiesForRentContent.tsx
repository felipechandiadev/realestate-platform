'use client';

import React, { useState, useEffect } from 'react';
import PropertyFilterRent from '@/shared/components/ui/PropertyFilterRent/PropertyFilterRent';
import PropertiesForRentGrid from './PropertiesForRentGrid';
import { FilterRentPropertiesDto, getRentPropertiesFiltered, RentPropertiesResponse } from '@/features/portal/properties/actions/rentProperties.action';

interface PropertiesForRentContentProps {
  className?: string;
}

/**
 * PropertiesForRentContent component
 * 
 * Main container for the rental properties feature.
 * Combines PropertyFilterRent with PropertiesForRentGrid to provide
 * a complete browsing experience for properties available for rent.
 * Manages filter state and coordinates data fetching.
 * 
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesForRentContent({
  className = '',
}: PropertiesForRentContentProps) {
  const [filters, setFilters] = useState<FilterRentPropertiesDto>({
    currency: 'CLP',
    page: 1,
    limit: 9,
  });
  const [propertiesData, setPropertiesData] = useState<RentPropertiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRentPropertiesFiltered(filters);
        setPropertiesData(data);
      } catch (err) {
        setError('Error al cargar las propiedades');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProperties();
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterRentPropertiesDto) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className={`properties-for-rent-content ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Propiedades en Arriendo
        </h1>

        <PropertyFilterRent
          initialFilters={filters}
          onFiltersChange={handleFiltersChange}
          className="mb-8"
        />

        <div className="mt-4 mb-6 text-sm text-gray-600">
          {propertiesData?.total && propertiesData.total > 0 ? (
            <p>
              Mostrando {propertiesData.data.length} de {propertiesData.total} propiedades
            </p>
          ) : null}
        </div>

        <PropertiesForRentGrid
          properties={propertiesData?.data || []}
          isLoading={isLoading}
          error={error ? 'Error al cargar las propiedades en arriendo' : null}
          total={propertiesData?.total || 0}
          page={filters.page || 1}
          pageSize={filters.limit || 9}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

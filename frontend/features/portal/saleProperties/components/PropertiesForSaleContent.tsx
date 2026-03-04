'use client';

import React, { useState, useEffect } from 'react';
import PropertyFilterSale from '@/shared/components/ui/PropertyFilterSale/PropertyFilterSale';
import PropertiesForSaleGrid from './PropertiesForSaleGrid';
import { FilterSalePropertiesDto, getSalePropertiesFiltered, SalePropertiesResponse } from '@/features/portal/properties/actions/saleProperties.action';

interface PropertiesForSaleContentProps {
  className?: string;
}

/**
 * PropertiesForSaleContent component
 * 
 * Main container for the sale properties feature.
 * Combines PropertyFilterSale with PropertiesForSaleGrid to provide
 * a complete browsing experience for properties available for purchase.
 * Manages filter state and coordinates data fetching.
 * 
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesForSaleContent({
  className = '',
}: PropertiesForSaleContentProps) {
  const [filters, setFilters] = useState<FilterSalePropertiesDto>({
    currency: 'CLP',
    page: 1,
    limit: 9,
  });
  const [propertiesData, setPropertiesData] = useState<SalePropertiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSalePropertiesFiltered(filters);
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

  const handleFiltersChange = (newFilters: FilterSalePropertiesDto) => {
    setFilters(newFilters);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
  };

  return (
    <div className={`properties-for-sale-content ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Propiedades en Venta
        </h1>

        <PropertyFilterSale
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

        <PropertiesForSaleGrid
          properties={propertiesData?.data || []}
          isLoading={isLoading}
          error={error ? 'Error al cargar las propiedades en venta' : null}
          total={propertiesData?.total || 0}
          page={filters.page || 1}
          pageSize={filters.limit || 9}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

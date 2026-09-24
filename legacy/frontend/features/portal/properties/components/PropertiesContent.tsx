'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertiesFilter, { ListingMode } from './PropertiesFilter';
import PropertiesGrid from './PropertiesGrid';
import { useProperties } from '@/features/portal/properties/hooks';
import type { PropertyFilter } from '@/features/portal/properties/types';
import { FilterSalePropertiesDto } from '@/features/portal/properties/actions/saleProperties.action';
import { FilterRentPropertiesDto } from '@/features/portal/properties/actions/rentProperties.action';

interface PropertiesContentProps {
  initialMode?: ListingMode;
  className?: string;
}

/**
 * PropertiesContent component
 * 
 * Main container component that combines PropertiesFilter and PropertiesGrid.
 * Manages the state for filters, pagination, and property listing mode.
 * Handles data fetching and coordinates between filter and grid components.
 * 
 * @param {ListingMode} initialMode - Initial listing mode ('sale' or 'rent')
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesContent({
  initialMode = 'sale',
  className = '',
}: PropertiesContentProps) {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<ListingMode>(initialMode);
  
  const [saleFilters, setSaleFilters] = useState<FilterSalePropertiesDto>(() => {
    const defaults: FilterSalePropertiesDto = {
      currency: 'CLP',
      page: 1,
      limit: 24,
    };

    return {
      ...defaults,
      bedrooms: searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined,
      bedroomsOperator: (searchParams.get('bedroomsOperator') as 'lte' | 'eq' | 'gte') || undefined,
      bathrooms: searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined,
      bathroomsOperator: (searchParams.get('bathroomsOperator') as 'lte' | 'eq' | 'gte') || undefined,
      parkingSpaces: searchParams.get('parkingSpaces') ? parseInt(searchParams.get('parkingSpaces')!) : undefined,
      parkingSpacesOperator: (searchParams.get('parkingSpacesOperator') as 'lte' | 'eq' | 'gte') || undefined,
      typeProperty: (searchParams.get('typeProperty') as string) || undefined,
      state: (searchParams.get('state') as string) || undefined,
      city: (searchParams.get('city') as string) || undefined,
      currency: (searchParams.get('currency') as string) || 'CLP',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
    };
  });

  const [rentFilters, setRentFilters] = useState<FilterRentPropertiesDto>({
    currency: 'CLP',
    page: 1,
    limit: 24,
  });

  // Convert filters to API format - pass all current mode filters
  const currentFilters = mode === 'sale' ? saleFilters : rentFilters;
  const apiFilters: PropertyFilter = {
    listingType: mode,
    bedrooms: currentFilters.bedrooms,
    bedroomsOperator: currentFilters.bedroomsOperator,
    bathrooms: currentFilters.bathrooms,
    bathroomsOperator: currentFilters.bathroomsOperator,
    parkingSpaces: currentFilters.parkingSpaces,
    parkingSpacesOperator: currentFilters.parkingSpacesOperator,
    typeProperty: currentFilters.typeProperty,
    city: currentFilters.city,
    state: currentFilters.state,
    currency: currentFilters.currency,
  };

  const {
    data: propertiesData,
    isLoading,
    error,
  } = useProperties({
    page: mode === 'sale' ? saleFilters.page : rentFilters.page,
    pageSize: mode === 'sale' ? saleFilters.limit : rentFilters.limit,
    filters: apiFilters,
  });

  const handleModeChange = (newMode: ListingMode) => {
    setMode(newMode);
  };

  const handleSaleFiltersChange = (filters: FilterSalePropertiesDto) => {
    setSaleFilters(filters);
  };

  const handleRentFiltersChange = (filters: FilterRentPropertiesDto) => {
    setRentFilters(filters);
  };

  const handlePageChange = (newPage: number) => {
    if (mode === 'sale') {
      setSaleFilters({ ...saleFilters, page: newPage });
    } else {
      setRentFilters({ ...rentFilters, page: newPage });
    }
  };

  return (
    <div className={`properties-content ${className}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          {mode === 'sale' ? 'Propiedades en Venta' : 'Propiedades en Arriendo'}
        </h1>

        <PropertiesFilter
          mode={mode}
          onModeChange={handleModeChange}
          onSaleFiltersChange={handleSaleFiltersChange}
          onRentFiltersChange={handleRentFiltersChange}
          initialSaleFilters={saleFilters}
          initialRentFilters={rentFilters}
          className="mb-8"
        />

        <PropertiesGrid
          properties={propertiesData?.items || []}
          isLoading={isLoading}
          error={error ? 'Error al cargar las propiedades' : null}
          total={propertiesData?.total || 0}
          page={mode === 'sale' ? saleFilters.page || 1 : rentFilters.page || 1}
          pageSize={mode === 'sale' ? saleFilters.limit || 9 : rentFilters.limit || 9}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

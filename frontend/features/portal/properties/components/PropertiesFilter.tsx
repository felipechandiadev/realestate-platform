'use client';

import React, { useState } from 'react';
import PropertyFilterSale from '@/shared/components/ui/PropertyFilterSale/PropertyFilterSale';
import PropertyFilterRent from '@/shared/components/ui/PropertyFilterRent/PropertyFilterRent';
import { FilterSalePropertiesDto } from '@/features/portal/properties/actions/saleProperties.action';
import { FilterRentPropertiesDto } from '@/features/portal/properties/actions/rentProperties.action';

export type ListingMode = 'sale' | 'rent';

interface PropertiesFilterProps {
  mode?: ListingMode;
  onModeChange?: (mode: ListingMode) => void;
  onSaleFiltersChange?: (filters: FilterSalePropertiesDto) => void;
  onRentFiltersChange?: (filters: FilterRentPropertiesDto) => void;
  initialSaleFilters?: FilterSalePropertiesDto;
  initialRentFilters?: FilterRentPropertiesDto;
  className?: string;
}

/**
 * PropertiesFilter component
 * 
 * Provides filtering interface for properties with support for both sale and rent modes.
 * Includes PropertyFilterSale and PropertyFilterRent as sub-filters.
 * 
 * @param {ListingMode} mode - Current filter mode ('sale' or 'rent')
 * @param {Function} onModeChange - Callback when mode changes
 * @param {Function} onSaleFiltersChange - Callback when sale filters change
 * @param {Function} onRentFiltersChange - Callback when rent filters change
 * @param {FilterSalePropertiesDto} initialSaleFilters - Initial filters for sale mode
 * @param {FilterRentPropertiesDto} initialRentFilters - Initial filters for rent mode
 * @param {string} className - Additional CSS classes
 */
export default function PropertiesFilter({
  mode = 'sale',
  onModeChange,
  onSaleFiltersChange,
  onRentFiltersChange,
  initialSaleFilters,
  initialRentFilters,
  className = '',
}: PropertiesFilterProps) {
  const [currentMode, setCurrentMode] = useState<ListingMode>(mode);

  const handleModeChange = (newMode: ListingMode) => {
    setCurrentMode(newMode);
    onModeChange?.(newMode);
  };

  return (
    <div className={`properties-filter ${className}`}>
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={() => handleModeChange('sale')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentMode === 'sale'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={currentMode === 'sale'}
        >
          Venta
        </button>
        <button
          onClick={() => handleModeChange('rent')}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            currentMode === 'rent'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={currentMode === 'rent'}
        >
          Arriendo
        </button>
      </div>

      <div className="filter-content">
        {currentMode === 'sale' && (
          <PropertyFilterSale
            initialFilters={initialSaleFilters}
            onFiltersChange={onSaleFiltersChange}
          />
        )}
        {currentMode === 'rent' && (
          <PropertyFilterRent
            initialFilters={initialRentFilters}
            onFiltersChange={onRentFiltersChange}
          />
        )}
      </div>
    </div>
  );
}

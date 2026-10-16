'use client';

import React, { useEffect, useState } from 'react';
import ListProperties from '../ListProperties';
import PropertyCardSkeleton from '@/shared/components/ui/PropertyCardSkeleton/PropertyCardSkeleton';
import type { PropertyData } from '@/features/properties/actions/portalProperties.action';
import PropertyFiltersSidebar from './PropertyFiltersSidebar';
import MobileFilterChips from './MobileFilterChips';
import MobileFilterDrawer from './MobileFilterDrawer';
import StickyFilterButton from './StickyFilterButton';
import { countActiveFilters, type PropertyFiltersState } from './filter-types';

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type Props = {
  filters: PropertyFiltersState;
  onFilterChange: (patch: Partial<PropertyFiltersState>) => void;
  onApply: () => void;
  onClear: () => void;
  onPageChange: (page: number) => void;
  /** Replace full filter state (used when applying mobile draft) */
  onReplaceFilters?: (next: PropertyFiltersState) => void;
  properties: PropertyData[];
  pagination?: Pagination;
  isLoading?: boolean;
};

export default function PropertyListingsLayout({
  filters,
  onFilterChange,
  onApply,
  onClear,
  onPageChange,
  onReplaceFilters,
  properties,
  pagination,
  isLoading = false,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const active = countActiveFilters(filters);

  useEffect(() => {
    if (drawerOpen) setDraft(filters);
  }, [drawerOpen, filters]);

  return (
    <div id="properties-container" className="w-full" data-test-id="properties-container">
      <MobileFilterChips filters={filters} onOpen={() => setDrawerOpen(true)} />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
        <PropertyFiltersSidebar
          filters={filters}
          onChange={(patch) => onFilterChange(patch)}
          onClear={onClear}
        />

        <div className="min-w-0 flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <ListProperties
              properties={properties as any}
              pagination={pagination}
              onPageChange={onPageChange}
              isLoading={isLoading}
            />
          ) : (
            <div className="py-10 text-center">
              <p className="text-lg text-muted-foreground">
                No se encontraron propiedades con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      </div>

      <StickyFilterButton
        onClick={() => setDrawerOpen(true)}
        activeCount={active}
        containerId="properties-container"
      />

      <MobileFilterDrawer
        open={drawerOpen}
        filters={draft}
        total={pagination?.total ?? 0}
        onChange={(patch) => setDraft((prev) => ({ ...prev, ...patch, page: 1 }))}
        onClear={() => {
          onClear();
          setDrawerOpen(false);
        }}
        onApply={() => {
          if (onReplaceFilters) onReplaceFilters(draft);
          else {
            onFilterChange(draft);
            onApply();
          }
        }}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

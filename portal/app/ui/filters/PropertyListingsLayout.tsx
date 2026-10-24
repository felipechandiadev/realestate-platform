'use client';

import React, { useEffect, useRef, useState } from 'react';
import ListProperties, { PropertyPaginationControls } from '../ListProperties';
import PropertyCardSkeleton from '@/shared/components/ui/PropertyCardSkeleton/PropertyCardSkeleton';
import type { PropertyData } from '@/features/properties/actions/portalProperties.action';
import PropertyFiltersSidebar from './PropertyFiltersSidebar';
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
  lockedOperation?: 'sale' | 'rent';
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
  lockedOperation,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const active = countActiveFilters(filters, {
    ignoreOperation: Boolean(lockedOperation),
  });
  const previousPageRef = useRef<number | null>(null);
  const paginationReadyRef = useRef(false);

  useEffect(() => {
    if (drawerOpen) setDraft(filters);
  }, [drawerOpen, filters]);

  // Al cambiar de página, subir hasta la primera fila del listado (tras cargar).
  // ListProperties también hace scroll, pero aquí se desmonta mientras isLoading
  // muestra skeletons, así que el efecto de allá no corre.
  useEffect(() => {
    const page = pagination?.page;
    if (typeof page !== 'number') return;

    if (!paginationReadyRef.current) {
      previousPageRef.current = page;
      paginationReadyRef.current = true;
      return;
    }

    if (isLoading || previousPageRef.current === page) return;

    previousPageRef.current = page;

    if (typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      const el = document.getElementById('properties-container');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const offset = 160; // sticky header + un poco más arriba
      const target = Math.max(rect.top + window.scrollY - offset, 0);
      window.scrollTo({ top: target, behavior: 'smooth' });
    });
  }, [pagination?.page, isLoading]);

  return (
    <div
      id="properties-container"
      className="w-full scroll-mt-24"
      data-test-id="properties-container"
    >
      <StickyFilterButton
        onClick={() => setDrawerOpen(true)}
        activeCount={active}
        containerId="properties-container"
      />

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-4">
        <PropertyFiltersSidebar
          filters={filters}
          onChange={(patch) => onFilterChange(patch)}
          onClear={onClear}
          lockedOperation={lockedOperation}
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
              properties={properties}
              pagination={pagination}
              onPageChange={onPageChange}
              isLoading={isLoading}
              showPagination={false}
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

      {/* Full-width footer: divider + pagination centered across sidebar + grid */}
      {pagination && (properties.length > 0 || isLoading) ? (
        <div className="mt-8 w-full border-t border-border">
          <PropertyPaginationControls pagination={pagination} onPageChange={onPageChange} />
        </div>
      ) : null}

      <MobileFilterDrawer
        open={drawerOpen}
        filters={draft}
        total={pagination?.total ?? 0}
        lockedOperation={lockedOperation}
        onChange={(patch) =>
          setDraft((prev) => ({
            ...prev,
            ...patch,
            ...(lockedOperation ? { operation: lockedOperation } : {}),
            page: 1,
          }))
        }
        onClear={() => {
          onClear();
          setDrawerOpen(false);
        }}
        onApply={() => {
          const next = lockedOperation ? { ...draft, operation: lockedOperation } : draft;
          if (onReplaceFilters) onReplaceFilters(next);
          else {
            onFilterChange(next);
            onApply();
          }
        }}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}

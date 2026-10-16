'use client';

import React from 'react';
import { Button } from '@realestate/ui';
import FilterFormSections from './FilterFormSections';
import type { PropertyFiltersState } from './filter-types';
import { countActiveFilters } from './filter-types';

type Props = {
  filters: PropertyFiltersState;
  onChange: (patch: Partial<PropertyFiltersState>) => void;
  onClear: () => void;
};

export default function PropertyFiltersSidebar({ filters, onChange, onClear }: Props) {
  const active = countActiveFilters(filters);

  return (
    <aside
      className="hidden w-[300px] shrink-0 rounded-lg border border-border bg-card p-3 md:block"
      data-test-id="property-filters-sidebar"
    >
      <div className="mb-2 flex items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Filtros</h2>
          {active > 0 ? (
            <p className="text-[11px] text-muted-foreground">{active} activos</p>
          ) : null}
        </div>
        <Button type="button" variant="outlined" className="px-2 py-1 text-xs" onClick={onClear}>
          Limpiar
        </Button>
      </div>
      <FilterFormSections filters={filters} onChange={onChange} />
    </aside>
  );
}

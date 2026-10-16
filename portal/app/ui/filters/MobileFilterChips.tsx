'use client';

import React from 'react';
import type { PropertyFiltersState } from './filter-types';

type Props = {
  filters: PropertyFiltersState;
  onOpen: (section?: 'operation' | 'type' | 'price') => void;
};

export default function MobileFilterChips({ filters, onOpen }: Props) {
  return (
    <div
      className="sticky top-0 z-20 -mx-2 mb-3 flex gap-2 overflow-x-auto bg-background/95 px-2 py-2 backdrop-blur md:hidden"
      data-test-id="mobile-filter-chips"
    >
      <button
        type="button"
        onClick={() => onOpen('operation')}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
          filters.operation ? 'border-primary bg-primary/10 text-primary' : 'border-border'
        }`}
      >
        {filters.operation === 'sale'
          ? 'En Venta'
          : filters.operation === 'rent'
            ? 'En Arriendo'
            : 'Operación'}
      </button>
      <button
        type="button"
        onClick={() => onOpen('type')}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
          filters.typeIds.length || filters.typeProperty
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border'
        }`}
      >
        Tipo{filters.typeIds.length ? ` (${filters.typeIds.length})` : ''}
      </button>
      <button
        type="button"
        onClick={() => onOpen('price')}
        className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
          filters.priceMin || filters.priceMax || filters.currency
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border'
        }`}
      >
        Precio
      </button>
    </div>
  );
}

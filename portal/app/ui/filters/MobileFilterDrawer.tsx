'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@realestate/ui';
import FilterFormSections from './FilterFormSections';
import type { PropertyFiltersState } from './filter-types';

type Props = {
  open: boolean;
  filters: PropertyFiltersState;
  /** Total para los filtros del borrador; `null` si no se pudo calcular. */
  total: number | null;
  isCounting?: boolean;
  onChange: (patch: Partial<PropertyFiltersState>) => void;
  onClear: () => void;
  onApply: () => void;
  onClose: () => void;
  lockedOperation?: 'sale' | 'rent';
};

export default function MobileFilterDrawer({
  open,
  filters,
  total,
  isCounting = false,
  onChange,
  onClear,
  onApply,
  onClose,
  lockedOperation,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const noResults = !isCounting && total === 0;
  const applyLabel = isCounting
    ? 'Calculando…'
    : total === null
      ? 'Ver propiedades'
      : noResults
        ? 'Sin resultados'
        : `Ver ${total} ${total === 1 ? 'propiedad' : 'propiedades'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Filtros de propiedades"
      data-test-id="mobile-filter-drawer"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-bold text-foreground">Filtros</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          >
            Limpiar todo
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1.5 hover:bg-muted"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        <FilterFormSections
          filters={filters}
          onChange={onChange}
          lockedOperation={lockedOperation}
        />
      </div>

      <footer className="sticky bottom-0 border-t border-border bg-background p-4">
        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={noResults}
          aria-live="polite"
          onClick={() => {
            onApply();
            onClose();
            document.getElementById('properties-container')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          {applyLabel}
        </Button>
      </footer>
    </div>
  );
}

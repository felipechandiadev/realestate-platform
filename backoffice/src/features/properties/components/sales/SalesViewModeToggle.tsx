'use client';

import {
  PROPERTY_VIEW_STORAGE_KEYS,
  PropertyViewModeToggle,
  usePropertyViewMode,
  type PropertyViewMode,
} from '@/features/properties/components/shared/propertyViewMode';

export type SalesViewMode = PropertyViewMode;

export function useSalesViewMode(): [SalesViewMode, (mode: SalesViewMode) => void] {
  return usePropertyViewMode(PROPERTY_VIEW_STORAGE_KEYS.sales);
}

interface SalesViewModeToggleProps {
  value: SalesViewMode;
  onChange: (mode: SalesViewMode) => void;
}

export function SalesViewModeToggle({ value, onChange }: SalesViewModeToggleProps) {
  return (
    <PropertyViewModeToggle
      value={value}
      onChange={onChange}
      testId="sales-view-mode-toggle"
    />
  );
}

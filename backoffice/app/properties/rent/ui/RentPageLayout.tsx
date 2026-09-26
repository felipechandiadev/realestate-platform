'use client';

import React from 'react';
import { BasicPageLayout } from '@realestate/ui';
import {
  PROPERTY_VIEW_STORAGE_KEYS,
  PropertyViewModeToggle,
  usePropertyViewMode,
} from '@/features/properties/components/shared/propertyViewMode';

interface RentPageLayoutProps {
  children: React.ReactNode;
}

export function RentPageLayout({ children }: RentPageLayoutProps) {
  const [view, setView] = usePropertyViewMode(PROPERTY_VIEW_STORAGE_KEYS.rent);

  return (
    <BasicPageLayout
      title="Propiedades en arriendo"
      headerActions={
        <PropertyViewModeToggle
          value={view}
          onChange={setView}
          testId="rent-view-mode-toggle"
        />
      }
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </BasicPageLayout>
  );
}

'use client';

import React from 'react';
import { BasicPageLayout } from '@realestate/ui';
import { SalesViewModeToggle, useSalesViewMode } from './SalesViewModeToggle';

interface PropertiesSalesPageLayoutProps {
  children: React.ReactNode;
}

export function PropertiesSalesPageLayout({ children }: PropertiesSalesPageLayoutProps) {
  const [view, setView] = useSalesViewMode();

  return (
    <BasicPageLayout
      title="Propiedades en venta"
      headerActions={<SalesViewModeToggle value={view} onChange={setView} />}
      contentClassName="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </BasicPageLayout>
  );
}

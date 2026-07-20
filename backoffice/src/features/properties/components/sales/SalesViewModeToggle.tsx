'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { ButtonGroupToggle } from '@realestate/ui';

export type SalesViewMode = 'table' | 'cards';

export function useSalesViewMode(): [SalesViewMode, (mode: SalesViewMode) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();

  const view: SalesViewMode = searchParams.get('view') === 'cards' ? 'cards' : 'table';

  const setView = useCallback(
    (mode: SalesViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === 'table') {
        params.delete('view');
      } else {
        params.set('view', mode);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return [view, setView];
}

interface SalesViewModeToggleProps {
  value: SalesViewMode;
  onChange: (mode: SalesViewMode) => void;
}

export function SalesViewModeToggle({ value, onChange }: SalesViewModeToggleProps) {
  return (
    <ButtonGroupToggle
      value={value}
      onChange={(id) => onChange(id as SalesViewMode)}
      aria-label="Modo de vista"
      data-test-id="sales-view-mode-toggle"
      options={[
        {
          id: 'table',
          label: <List className="h-4 w-4" aria-hidden />,
        },
        {
          id: 'cards',
          label: <LayoutGrid className="h-4 w-4" aria-hidden />,
        },
      ]}
    />
  );
}

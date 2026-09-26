'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';
import { ButtonGroupToggle } from '@realestate/ui';

export type PropertyViewMode = 'table' | 'cards';

export const PROPERTY_VIEW_STORAGE_KEYS = {
  sales: 'backoffice:properties-sales-view',
  rent: 'backoffice:properties-rent-view',
} as const;

function readStoredView(storageKey: string): PropertyViewMode | null {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw === 'cards' || raw === 'table' ? raw : null;
  } catch {
    return null;
  }
}

function writeStoredView(storageKey: string, mode: PropertyViewMode) {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    // El modo de vista sigue en la URL si el navegador bloquea storage.
  }
}

export function usePropertyViewMode(
  storageKey: string,
): [PropertyViewMode, (mode: PropertyViewMode) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get('view');
  const urlView: PropertyViewMode | null =
    urlParam === 'cards' || urlParam === 'table' ? urlParam : null;
  const [storedView, setStoredView] = useState<PropertyViewMode | null>(null);

  useEffect(() => {
    if (urlView) {
      writeStoredView(storageKey, urlView);
      setStoredView(urlView);
      return;
    }

    const saved = readStoredView(storageKey);
    setStoredView(saved);
    if (saved === 'cards') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', 'cards');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [router, searchParams, storageKey, urlView]);

  const view: PropertyViewMode = urlView ?? storedView ?? 'table';

  const setView = useCallback(
    (mode: PropertyViewMode) => {
      writeStoredView(storageKey, mode);
      setStoredView(mode);
      const params = new URLSearchParams(searchParams.toString());
      if (mode === 'table') {
        params.delete('view');
      } else {
        params.set('view', mode);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, storageKey],
  );

  return [view, setView];
}

interface PropertyViewModeToggleProps {
  value: PropertyViewMode;
  onChange: (mode: PropertyViewMode) => void;
  testId: string;
}

export function PropertyViewModeToggle({ value, onChange, testId }: PropertyViewModeToggleProps) {
  return (
    <ButtonGroupToggle
      value={value}
      onChange={(id) => onChange(id as PropertyViewMode)}
      aria-label="Modo de vista"
      data-test-id={testId}
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

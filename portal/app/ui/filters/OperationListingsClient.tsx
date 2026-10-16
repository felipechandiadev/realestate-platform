'use client';

import React, { useEffect } from 'react';
import PropertyListingsLayout from './PropertyListingsLayout';
import { usePropertyFiltersState } from './usePropertyFiltersState';
import { EMPTY_PROPERTY_FILTERS } from './filter-types';
import type { PropertyData } from '@/features/properties/actions/portalProperties.action';
import type { ListingsFilterVariant } from '@/features/cms/actions/portal-listings.action';

type Props = {
  operation: 'sale' | 'rent';
  title: string;
  filterVariant: ListingsFilterVariant;
  initialProperties?: PropertyData[];
  classicSlot: React.ReactNode;
};

/**
 * When CMS variant is sidebar_v2, renders the shared v2 listings UI with operation locked.
 * Otherwise renders the classic sale/rent content passed as classicSlot.
 */
export default function OperationListingsClient({
  operation,
  title,
  filterVariant,
  initialProperties = [],
  classicSlot,
}: Props) {
  if (filterVariant !== 'sidebar_v2') {
    return <>{classicSlot}</>;
  }

  return (
    <OperationListingsV2 operation={operation} title={title} initialProperties={initialProperties} />
  );
}

function OperationListingsV2({
  operation,
  title,
  initialProperties,
}: {
  operation: 'sale' | 'rent';
  title: string;
  initialProperties: PropertyData[];
}) {
  const {
    filters,
    applyFilters,
    replaceFilters,
    setPage,
    properties,
    pagination,
    isLoading,
  } = usePropertyFiltersState({
    initialProperties,
    liveFetch: true,
  });

  useEffect(() => {
    if (filters.operation !== operation) {
      applyFilters({ operation }, { immediate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operation]);

  return (
    <div className="mx-auto max-w-[1400px] px-2 py-8 sm:px-3 lg:px-4">
      <h1 className="mb-6 text-center text-3xl font-bold text-foreground">{title}</h1>
      <PropertyListingsLayout
        filters={{ ...filters, operation }}
        onFilterChange={(patch) => applyFilters({ ...patch, operation })}
        onApply={() => replaceFilters({ ...filters, operation })}
        onClear={() => replaceFilters({ ...EMPTY_PROPERTY_FILTERS, operation })}
        onPageChange={setPage}
        onReplaceFilters={(next) => replaceFilters({ ...next, operation })}
        properties={properties}
        pagination={pagination}
        isLoading={isLoading}
      />
    </div>
  );
}

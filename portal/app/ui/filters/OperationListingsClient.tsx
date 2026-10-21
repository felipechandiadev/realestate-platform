'use client';

import React from 'react';
import PropertyListingsLayout from './PropertyListingsLayout';
import { usePropertyFiltersState } from './usePropertyFiltersState';
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
    clear,
    setPage,
    properties,
    pagination,
    isLoading,
  } = usePropertyFiltersState({
    initialProperties,
    liveFetch: true,
    lockedOperation: operation,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-center text-3xl font-bold text-foreground">{title}</h1>
      <PropertyListingsLayout
        filters={filters}
        lockedOperation={operation}
        onFilterChange={applyFilters}
        onApply={() => replaceFilters(filters)}
        onClear={clear}
        onPageChange={setPage}
        onReplaceFilters={replaceFilters}
        properties={properties}
        pagination={pagination}
        isLoading={isLoading}
      />
    </div>
  );
}

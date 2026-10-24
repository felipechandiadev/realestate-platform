'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyFilter from './ui/PropertyFilter';
import ListProperties from './ui/ListProperties';
import { PropertyData, getPublishedPropertiesFiltered, type PublishedPropertiesResponse } from '@/features/properties/actions/portalProperties.action';

type ListingsPagination = PublishedPropertiesResponse['pagination'];
import { getIdentity } from '@/features/cms/actions/identity.action';
import type { ListingsFilterVariant } from '@/features/cms/actions/portal-listings.action';
import PropertyListingsLayout from './ui/filters/PropertyListingsLayout';
import { usePropertyFiltersState } from './ui/filters/usePropertyFiltersState';
interface PortalClientProps {
  initialProperties: PropertyData[];
  initialPagination?: ListingsPagination;
  initialCompanyName?: string;
  filterVariant?: ListingsFilterVariant;
}

function ClassicPortalListings({
  initialProperties,
  initialPagination,
}: {
  initialProperties: PropertyData[];
  initialPagination?: ListingsPagination;
}) {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyData[]>(initialProperties);
  const defaultPagination = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  const [pagination, setPagination] = useState<ListingsPagination>(initialPagination || defaultPagination);
  const [currentFilters, setCurrentFilters] = useState({
    operation: '',
    typeProperty: '',
    state: '',
    city: '',
    currency: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    bedroomsOperator: 'gte' as 'lte' | 'eq' | 'gte',
    bathroomsOperator: 'gte' as 'lte' | 'eq' | 'gte',
    parkingSpacesOperator: 'gte' as 'lte' | 'eq' | 'gte',
    builtSquareMetersMin: 0,
    landSquareMetersMin: 0,
    constructionYearMin: 0,
    priceMin: 0,
    priceMax: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentFilters({
      operation: searchParams.get('operation') || '',
      typeProperty: searchParams.get('typeProperty') || '',
      state: searchParams.get('state') || '',
      city: searchParams.get('city') || '',
      currency: searchParams.get('currency') || '',
      bedrooms: parseInt(searchParams.get('bedrooms') || '0'),
      bathrooms: parseInt(searchParams.get('bathrooms') || '0'),
      parkingSpaces: parseInt(searchParams.get('parkingSpaces') || '0'),
      bedroomsOperator: (searchParams.get('bedroomsOperator') as 'lte' | 'eq' | 'gte') || 'gte',
      bathroomsOperator: (searchParams.get('bathroomsOperator') as 'lte' | 'eq' | 'gte') || 'gte',
      parkingSpacesOperator:
        (searchParams.get('parkingSpacesOperator') as 'lte' | 'eq' | 'gte') || 'gte',
      builtSquareMetersMin: parseInt(searchParams.get('builtSquareMetersMin') || '0'),
      landSquareMetersMin: parseInt(searchParams.get('landSquareMetersMin') || '0'),
      constructionYearMin: parseInt(searchParams.get('constructionYearMin') || '0'),
      priceMin: parseInt(searchParams.get('priceMin') || '0'),
      priceMax: parseInt(searchParams.get('priceMax') || '0'),
    });
  }, [searchParams]);

  const loadProperties = useCallback(async (filters: typeof currentFilters, page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await getPublishedPropertiesFiltered({
        ...filters,
        page,
      });
      if (result) {
        setProperties(result.data);
        setPagination(result.pagination);
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val) params.set(key, String(val));
        });
        if (page > 1) params.set('page', page.toString());
        window.history.replaceState(null, '', `?${params.toString()}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <div className="sticky top-20 z-30 bg-background md:top-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertyFilter
            initialFilters={currentFilters}
            onFiltersChange={(newFilters) => {
              setCurrentFilters(newFilters as typeof currentFilters);
              void loadProperties(newFilters as typeof currentFilters, 1);
            }}
            isLoading={isLoading}
          />
        </div>
      </div>

      {properties && properties.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ListProperties
            properties={properties}
            pagination={pagination}
            onPageChange={(page) => loadProperties(currentFilters, page)}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">
          <p className="text-lg text-gray-500">
            No se encontraron propiedades con los filtros seleccionados.
          </p>
        </div>
      )}
    </>
  );
}

function SidebarV2PortalListings({
  initialProperties,
  initialPagination,
}: {
  initialProperties: PropertyData[];
  initialPagination?: ListingsPagination;
}) {
  const {
    filters,
    applyFilters,
    replaceFilters,
    apply,
    clear,
    setPage,
    properties,
    pagination,
    isLoading,
  } = usePropertyFiltersState({
    initialProperties,
    initialPagination,
    liveFetch: true,
  });

  return (
    <div className="w-full">
      <PropertyListingsLayout
        filters={filters}
        onFilterChange={(patch) => applyFilters(patch)}
        onApply={apply}
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

export default function PortalClient({
  initialProperties,
  initialPagination,
  initialCompanyName = '',
  filterVariant = 'classic',
}: PortalClientProps) {
  const [identity, setIdentity] = useState<Awaited<ReturnType<typeof getIdentity>> | { name: string } | null>(
    initialCompanyName ? { name: initialCompanyName } : null,
  );

  useEffect(() => {
    if (initialCompanyName) return;
    let ignore = false;
    async function loadIdentity() {
      try {
        const id = await getIdentity();
        if (!ignore && id) setIdentity(id);
      } catch {
        /* ignore */
      }
    }
    loadIdentity();
    return () => {
      ignore = true;
    };
  }, [initialCompanyName]);

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 pb-6 pt-6 text-center sm:px-6 lg:px-8">
        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
          {identity?.name || ''}
        </h1>
        <p className="text-lg font-light text-muted-foreground sm:text-xl">
          Seleccionamos propiedades con carácter, diseño y alto valor. Te acompañamos con un servicio
          personalizado y discreto para que encuentres un lugar a la altura de tus expectativas.
        </p>
      </div>

      {filterVariant === 'sidebar_v2' ? (
        <SidebarV2PortalListings
          initialProperties={initialProperties}
          initialPagination={initialPagination}
        />
      ) : (
        <ClassicPortalListings
          initialProperties={initialProperties}
          initialPagination={initialPagination}
        />
      )}
    </div>
  );
}

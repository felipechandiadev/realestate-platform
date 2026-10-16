'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  getPublishedPropertiesFiltered,
  type PropertyData,
  type PublishedPropertiesResponse,
} from '@/features/properties/actions/portalProperties.action';
import { EMPTY_PROPERTY_FILTERS, type PropertyFiltersState } from './filter-types';
import {
  filtersFromSearchParams,
  filtersToApiPayload,
  filtersToSearchParams,
} from './url-sync';

type Pagination = PublishedPropertiesResponse['pagination'];

type UsePropertyFiltersStateArgs = {
  initialProperties: PropertyData[];
  initialPagination?: Pagination;
  /** When true, fetch on every draft change after 300ms. When false, only on apply(). */
  liveFetch?: boolean;
};

export function usePropertyFiltersState({
  initialProperties,
  initialPagination,
  liveFetch = true,
}: UsePropertyFiltersStateArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [filters, setFilters] = useState<PropertyFiltersState>(() =>
    filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
  );
  const [properties, setProperties] = useState(initialProperties);
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination || {
      total: 0,
      page: 1,
      limit: 9,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  );
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextLive = useRef(false);

  const syncUrl = useCallback(
    (next: PropertyFiltersState) => {
      const params = filtersToSearchParams(next);
      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [pathname, router],
  );

  const fetchResults = useCallback(async (next: PropertyFiltersState) => {
    setIsLoading(true);
    try {
      const result = await getPublishedPropertiesFiltered(filtersToApiPayload(next));
      if (result) {
        setProperties(result.data);
        setPagination(result.pagination);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyFilters = useCallback(
    (patch: Partial<PropertyFiltersState>, opts?: { immediate?: boolean; resetPage?: boolean }) => {
      setFilters((prev) => {
        const next: PropertyFiltersState = {
          ...prev,
          ...patch,
          page: opts?.resetPage === false ? (patch.page ?? prev.page) : patch.page ?? 1,
        };

        if (debounceRef.current) clearTimeout(debounceRef.current);

        const run = () => {
          syncUrl(next);
          void fetchResults(next);
        };

        if (opts?.immediate || !liveFetch) {
          if (opts?.immediate) run();
        } else {
          debounceRef.current = setTimeout(run, 300);
        }

        return next;
      });
    },
    [fetchResults, liveFetch, syncUrl],
  );

  const apply = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl(filters);
    void fetchResults(filters);
  }, [fetchResults, filters, syncUrl]);

  const clear = useCallback(() => {
    const next = { ...EMPTY_PROPERTY_FILTERS };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl(next);
    void fetchResults(next);
  }, [fetchResults, syncUrl]);

  const replaceFilters = useCallback(
    (next: PropertyFiltersState) => {
      const normalized = { ...next, page: next.page || 1 };
      setFilters(normalized);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      syncUrl(normalized);
      void fetchResults(normalized);
    },
    [fetchResults, syncUrl],
  );

  const setPage = useCallback(
    (page: number) => {
      applyFilters({ page }, { immediate: true, resetPage: false });
    },
    [applyFilters],
  );

  // Sync from URL on external navigation (back/forward)
  useEffect(() => {
    if (skipNextLive.current) {
      skipNextLive.current = false;
      return;
    }
    const fromUrl = filtersFromSearchParams(new URLSearchParams(searchParams.toString()));
    setFilters(fromUrl);
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return {
    filters,
    setFilters,
    applyFilters,
    replaceFilters,
    apply,
    clear,
    setPage,
    properties,
    pagination,
    isLoading: isLoading || isPending,
    total: pagination.total,
  };
}

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
  /** Lock operation filter (sale/rent listing pages). */
  lockedOperation?: 'sale' | 'rent';
};

export function usePropertyFiltersState({
  initialProperties,
  initialPagination,
  liveFetch = true,
  lockedOperation,
}: UsePropertyFiltersStateArgs) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const withLock = useCallback(
    (filters: PropertyFiltersState): PropertyFiltersState =>
      lockedOperation ? { ...filters, operation: lockedOperation } : filters,
    [lockedOperation],
  );

  const [filters, setFilters] = useState<PropertyFiltersState>(() =>
    withLock(filtersFromSearchParams(new URLSearchParams(searchParams.toString()))),
  );
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

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
    [pathname, router, startTransition],
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
      const prev = filtersRef.current;
      const next = withLock({
        ...prev,
        ...patch,
        page: opts?.resetPage === false ? (patch.page ?? prev.page) : patch.page ?? 1,
      });

      filtersRef.current = next;
      setFilters(next);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      const run = () => {
        syncUrl(next);
        void fetchResults(next);
      };

      if (opts?.immediate) {
        run();
      } else if (liveFetch) {
        debounceRef.current = setTimeout(run, 300);
      }
    },
    [fetchResults, liveFetch, syncUrl, withLock],
  );

  const apply = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const next = withLock(filtersRef.current);
    syncUrl(next);
    void fetchResults(next);
  }, [fetchResults, syncUrl, withLock]);

  const clear = useCallback(() => {
    const next = withLock({ ...EMPTY_PROPERTY_FILTERS });
    filtersRef.current = next;
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    syncUrl(next);
    void fetchResults(next);
  }, [fetchResults, syncUrl, withLock]);

  const replaceFilters = useCallback(
    (nextInput: PropertyFiltersState) => {
      const normalized = withLock({ ...nextInput, page: nextInput.page || 1 });
      filtersRef.current = normalized;
      setFilters(normalized);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      syncUrl(normalized);
      void fetchResults(normalized);
    },
    [fetchResults, syncUrl, withLock],
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
    const fromUrl = withLock(
      filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    );
    filtersRef.current = fromUrl;
    setFilters(fromUrl);
  }, [searchParams, withLock]);

  // Ensure locked operation is in state/URL on mount and when lock changes
  useEffect(() => {
    if (!lockedOperation) return;
    const current = filtersRef.current;
    if (current.operation !== lockedOperation) {
      applyFilters({ operation: lockedOperation }, { immediate: true });
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    if (params.get('operation') !== lockedOperation) {
      syncUrl(current);
    }
    // Las páginas de venta/arriendo llegan sin resultados iniciales: cargar al montar.
    void fetchResults(current);
    // Only re-run when the locked page changes (sale <-> rent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedOperation]);

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
    lockedOperation,
  };
}

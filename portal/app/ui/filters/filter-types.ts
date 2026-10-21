import type { OtherFeatureKey } from '@realestate/ui';

export type ListingsFilterVariant = 'classic' | 'sidebar_v2';

export type PropertyFiltersState = {
  operation: string;
  typeIds: string[];
  /** Legacy single type name (classic compat) */
  typeProperty: string;
  state: string;
  city: string;
  currency: string;
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  bedroomsOperator: 'lte' | 'eq' | 'gte';
  bathroomsOperator: 'lte' | 'eq' | 'gte';
  parkingSpacesOperator: 'lte' | 'eq' | 'gte';
  builtSquareMetersMin: number;
  builtSquareMetersMax: number;
  landSquareMetersMin: number;
  landSquareMetersMax: number;
  constructionYearMin: number;
  otherFeatures: OtherFeatureKey[];
  page: number;
};

export const EMPTY_PROPERTY_FILTERS: PropertyFiltersState = {
  operation: '',
  typeIds: [],
  typeProperty: '',
  state: '',
  city: '',
  currency: '',
  priceMin: 0,
  priceMax: 0,
  bedrooms: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  bedroomsOperator: 'gte',
  bathroomsOperator: 'gte',
  parkingSpacesOperator: 'gte',
  builtSquareMetersMin: 0,
  builtSquareMetersMax: 0,
  landSquareMetersMin: 0,
  landSquareMetersMax: 0,
  constructionYearMin: 0,
  otherFeatures: [],
  page: 1,
};

export function countActiveFilters(
  filters: PropertyFiltersState,
  opts?: { ignoreOperation?: boolean },
): number {
  let n = 0;
  if (filters.operation && !opts?.ignoreOperation) n += 1;
  if (filters.typeIds.length || filters.typeProperty) n += 1;
  if (filters.state) n += 1;
  if (filters.city) n += 1;
  if (filters.currency && filters.currency !== 'all') n += 1;
  if (filters.priceMin > 0 || filters.priceMax > 0) n += 1;
  if (filters.bedrooms > 0) n += 1;
  if (filters.bathrooms > 0) n += 1;
  if (filters.parkingSpaces > 0) n += 1;
  if (filters.builtSquareMetersMin > 0 || filters.builtSquareMetersMax > 0) n += 1;
  if (filters.landSquareMetersMin > 0 || filters.landSquareMetersMax > 0) n += 1;
  if (filters.constructionYearMin > 0) n += 1;
  if (filters.otherFeatures.length) n += 1;
  return n;
}

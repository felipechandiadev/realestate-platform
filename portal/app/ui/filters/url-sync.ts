import { normalizeOtherFeatures, type OtherFeatureKey } from '@realestate/ui';
import { EMPTY_PROPERTY_FILTERS, type PropertyFiltersState } from './filter-types';

function num(value: string | null): number {
  if (!value) return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function filtersFromSearchParams(
  params: URLSearchParams,
): PropertyFiltersState {
  const types = params.get('types') || params.get('typeIds') || '';
  const typeIds = types
    ? types.split(',').map((t) => t.trim()).filter(Boolean)
    : [];
  const featuresRaw = params.get('features') || params.get('otherFeatures') || '';
  const otherFeatures = normalizeOtherFeatures(
    featuresRaw ? featuresRaw.split(',') : [],
  ) as OtherFeatureKey[];

  const bedrooms = num(params.get('bedrooms'));
  const bathrooms = num(params.get('bathrooms'));

  return {
    ...EMPTY_PROPERTY_FILTERS,
    operation: params.get('operation') || '',
    typeIds,
    typeProperty: typeIds.length ? '' : params.get('typeProperty') || '',
    state: params.get('state') || '',
    city: params.get('city') || '',
    currency: params.get('currency') || '',
    priceMin: num(params.get('priceMin')),
    priceMax: num(params.get('priceMax')),
    bedrooms,
    bathrooms,
    parkingSpaces: num(params.get('parkingSpaces')),
    bedroomsOperator: (params.get('bedroomsOperator') as 'lte' | 'eq' | 'gte') || (bedrooms >= 4 ? 'gte' : 'gte'),
    bathroomsOperator: (params.get('bathroomsOperator') as 'lte' | 'eq' | 'gte') || (bathrooms >= 3 ? 'gte' : 'gte'),
    parkingSpacesOperator:
      (params.get('parkingSpacesOperator') as 'lte' | 'eq' | 'gte') || 'gte',
    builtSquareMetersMin: num(params.get('builtSquareMetersMin') || params.get('builtMin')),
    builtSquareMetersMax: num(params.get('builtSquareMetersMax') || params.get('builtMax')),
    landSquareMetersMin: num(params.get('landSquareMetersMin') || params.get('landMin')),
    landSquareMetersMax: num(params.get('landSquareMetersMax') || params.get('landMax')),
    constructionYearMin: num(params.get('constructionYearMin')),
    otherFeatures,
    page: Math.max(1, parseInt(params.get('page') || '1', 10) || 1),
  };
}

export function filtersToSearchParams(filters: PropertyFiltersState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.operation) params.set('operation', filters.operation);
  if (filters.typeIds.length) params.set('types', filters.typeIds.join(','));
  else if (filters.typeProperty) params.set('typeProperty', filters.typeProperty);
  if (filters.state) params.set('state', filters.state);
  if (filters.city) params.set('city', filters.city);
  if (filters.currency && filters.currency !== 'all') params.set('currency', filters.currency);
  if (filters.priceMin > 0) params.set('priceMin', String(filters.priceMin));
  if (filters.priceMax > 0) params.set('priceMax', String(filters.priceMax));
  if (filters.bedrooms > 0) {
    params.set('bedrooms', String(filters.bedrooms));
    params.set('bedroomsOperator', filters.bedroomsOperator || 'gte');
  }
  if (filters.bathrooms > 0) {
    params.set('bathrooms', String(filters.bathrooms));
    params.set('bathroomsOperator', filters.bathroomsOperator || 'gte');
  }
  if (filters.parkingSpaces > 0) {
    params.set('parkingSpaces', String(filters.parkingSpaces));
    params.set('parkingSpacesOperator', filters.parkingSpacesOperator || 'gte');
  }
  if (filters.builtSquareMetersMin > 0) {
    params.set('builtSquareMetersMin', String(filters.builtSquareMetersMin));
  }
  if (filters.builtSquareMetersMax > 0) {
    params.set('builtSquareMetersMax', String(filters.builtSquareMetersMax));
  }
  if (filters.landSquareMetersMin > 0) {
    params.set('landSquareMetersMin', String(filters.landSquareMetersMin));
  }
  if (filters.landSquareMetersMax > 0) {
    params.set('landSquareMetersMax', String(filters.landSquareMetersMax));
  }
  if (filters.constructionYearMin > 0) {
    params.set('constructionYearMin', String(filters.constructionYearMin));
  }
  if (filters.otherFeatures.length) {
    params.set('features', filters.otherFeatures.join(','));
  }
  if (filters.page > 1) params.set('page', String(filters.page));
  return params;
}

export function filtersToApiPayload(filters: PropertyFiltersState) {
  return {
    operation: filters.operation || undefined,
    typeProperty: filters.typeIds.length ? undefined : filters.typeProperty || undefined,
    typeIds: filters.typeIds.length ? filters.typeIds.join(',') : undefined,
    state: filters.state || undefined,
    city: filters.city || undefined,
    currency: filters.currency || undefined,
    priceMin: filters.priceMin || undefined,
    priceMax: filters.priceMax || undefined,
    bedrooms: filters.bedrooms || undefined,
    bathrooms: filters.bathrooms || undefined,
    parkingSpaces: filters.parkingSpaces || undefined,
    bedroomsOperator: filters.bedrooms ? filters.bedroomsOperator : undefined,
    bathroomsOperator: filters.bathrooms ? filters.bathroomsOperator : undefined,
    parkingSpacesOperator: filters.parkingSpaces ? filters.parkingSpacesOperator : undefined,
    builtSquareMetersMin: filters.builtSquareMetersMin || undefined,
    builtSquareMetersMax: filters.builtSquareMetersMax || undefined,
    landSquareMetersMin: filters.landSquareMetersMin || undefined,
    landSquareMetersMax: filters.landSquareMetersMax || undefined,
    constructionYearMin: filters.constructionYearMin || undefined,
    otherFeatures: filters.otherFeatures.length
      ? filters.otherFeatures.join(',')
      : undefined,
    page: filters.page || 1,
  };
}

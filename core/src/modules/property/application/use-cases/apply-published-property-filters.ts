import { SelectQueryBuilder } from 'typeorm';
import { Property } from '../../domain/property.entity';
import { isOtherFeatureKey } from '../../domain/other-features';

function parseList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
}

function parsePositiveNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

/**
 * Applies list/filter query params shared by published/sale/rent filtered endpoints.
 */
export function applyPublishedPropertyFilters(
  query: SelectQueryBuilder<Property>,
  filters: Record<string, any>,
): SelectQueryBuilder<Property> {
  let q = query;

  if (filters?.operation && filters.operation !== '' && filters.operation !== null) {
    q = q.andWhere('property.operationType = :operation', {
      operation: filters.operation,
    });
  }

  const typeIds = parseList(filters?.typeIds ?? filters?.types);
  const typeNames = parseList(filters?.typeProperty);
  if (typeIds.length > 0) {
    q = q.andWhere('pt.id IN (:...typeIds)', { typeIds });
  } else if (typeNames.length === 1) {
    q = q.andWhere('pt.name = :typeProperty', { typeProperty: typeNames[0] });
  } else if (typeNames.length > 1) {
    q = q.andWhere('pt.name IN (:...typeNames)', { typeNames });
  }

  if (filters?.state && filters.state !== '' && filters.state !== null) {
    q = q.andWhere('property.state = :state', { state: filters.state });
  }

  if (filters?.city && filters.city !== '' && filters.city !== null) {
    q = q.andWhere('property.city = :city', { city: filters.city });
  }

  if (
    filters?.currency &&
    filters.currency !== '' &&
    filters.currency !== 'all' &&
    filters.currency !== null
  ) {
    q = q.andWhere('property.currencyPrice = :currency', { currency: filters.currency });
  }

  const priceMin = parsePositiveNumber(filters?.priceMin);
  const priceMax = parsePositiveNumber(filters?.priceMax);
  if (priceMin !== undefined) {
    q = q.andWhere('property.price >= :priceMin', { priceMin });
  }
  if (priceMax !== undefined) {
    q = q.andWhere('property.price <= :priceMax', { priceMax });
  }

  const numericFilter = (field: string, value: any, operator?: string) => {
    if (value && parseInt(value, 10) > 0) {
      const op = operator || 'gte';
      const opMap: Record<string, string> = { lte: '<=', eq: '=', gte: '>=' };
      const sqlOp = opMap[op] || '>=';
      q = q.andWhere(`property.${field} ${sqlOp} :${field}`, {
        [field]: parseInt(value, 10),
      });
    }
  };

  numericFilter('bedrooms', filters?.bedrooms, filters?.bedroomsOperator);
  numericFilter('bathrooms', filters?.bathrooms, filters?.bathroomsOperator);
  numericFilter('parkingSpaces', filters?.parkingSpaces, filters?.parkingSpacesOperator);

  const builtMin = parsePositiveNumber(filters?.builtSquareMetersMin);
  const builtMax = parsePositiveNumber(filters?.builtSquareMetersMax);
  if (builtMin !== undefined) {
    q = q.andWhere('property.builtSquareMeters >= :builtSquareMetersMin', {
      builtSquareMetersMin: builtMin,
    });
  }
  if (builtMax !== undefined) {
    q = q.andWhere('property.builtSquareMeters <= :builtSquareMetersMax', {
      builtSquareMetersMax: builtMax,
    });
  }

  const landMin = parsePositiveNumber(filters?.landSquareMetersMin);
  const landMax = parsePositiveNumber(filters?.landSquareMetersMax);
  if (landMin !== undefined) {
    q = q.andWhere('property.landSquareMeters >= :landSquareMetersMin', {
      landSquareMetersMin: landMin,
    });
  }
  if (landMax !== undefined) {
    q = q.andWhere('property.landSquareMeters <= :landSquareMetersMax', {
      landSquareMetersMax: landMax,
    });
  }

  if (filters?.constructionYearMin && parseInt(filters.constructionYearMin, 10) > 0) {
    q = q.andWhere('property.constructionYear >= :constructionYearMin', {
      constructionYearMin: parseInt(filters.constructionYearMin, 10),
    });
  }

  const featureKeys = parseList(filters?.otherFeatures ?? filters?.features).filter(
    isOtherFeatureKey,
  );
  featureKeys.forEach((key, index) => {
    const param = `otherFeature${index}`;
    // MySQL JSON: require each selected amenity key to be present in the array
    q = q.andWhere(`JSON_CONTAINS(property.otherFeatures, :${param})`, {
      [param]: JSON.stringify(key),
    });
  });

  if (filters?.search && String(filters.search).trim() !== '') {
    const searchTerm = `%${String(filters.search).trim()}%`;
    q = q.andWhere(
      '(LOWER(property.title) LIKE LOWER(:search) OR LOWER(property.description) LIKE LOWER(:search))',
      { search: searchTerm },
    );
  }

  return q;
}

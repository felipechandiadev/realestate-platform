'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyFilter from './ui/PropertyFilter';
import ListProperties from './ui/ListProperties';
import { PropertyData, getPublishedPropertiesFiltered } from '@/features/portal/properties/actions/portalProperties.action';
import { getIdentity } from '@/features/backoffice/cms/actions/identity.action';

interface PortalClientProps {
  initialProperties: PropertyData[];
  initialPagination?: any;
}

export default function PortalClient({ initialProperties, initialPagination }: PortalClientProps) {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<PropertyData[]>(initialProperties);
  
  // Asegurar que pagination siempre tenga un objeto válido
  const defaultPagination = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };
  
  const [pagination, setPagination] = useState<any>(initialPagination || defaultPagination);

  useEffect(() => {
    console.log('📊 [PortalClient] initialPagination:', initialPagination);
    console.log('📊 [PortalClient] pagination state:', pagination);
  }, [initialPagination, pagination]);
  const [currentFilters, setCurrentFilters] = useState<{
    operation?: string;
    typeProperty?: string;
    state?: string;
    city?: string;
    currency?: string;
    bedrooms?: number;
    bathrooms?: number;
    parkingSpaces?: number;
    bedroomsOperator?: 'lte' | 'eq' | 'gte';
    bathroomsOperator?: 'lte' | 'eq' | 'gte';
    parkingSpacesOperator?: 'lte' | 'eq' | 'gte';
    builtSquareMetersMin?: number;
    landSquareMetersMin?: number;
    constructionYearMin?: number;
    priceMin?: number;
    priceMax?: number;
  }>({
    operation: '',
    typeProperty: '',
    state: '',
    city: '',
    currency: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpaces: 0,
    bedroomsOperator: 'gte',
    bathroomsOperator: 'gte',
    parkingSpacesOperator: 'gte',
    builtSquareMetersMin: 0,
    landSquareMetersMin: 0,
    constructionYearMin: 0,
    priceMin: 0,
    priceMax: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [identity, setIdentity] = useState<any | null>(null);

  useEffect(() => {
    let ignore = false;
    async function loadIdentity() {
      try {
        const id = await getIdentity();
        if (!ignore && id) setIdentity(id);
      } catch (err) {
        console.error('PortalClient: failed to load identity', err);
      }
    }
    loadIdentity();
    return () => { ignore = true; };
  }, []);

  // Initialize filters from URL parameters
  useEffect(() => {
    const filtersFromUrl = {
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
      parkingSpacesOperator: (searchParams.get('parkingSpacesOperator') as 'lte' | 'eq' | 'gte') || 'gte',
      builtSquareMetersMin: parseInt(searchParams.get('builtSquareMetersMin') || '0'),
      landSquareMetersMin: parseInt(searchParams.get('landSquareMetersMin') || '0'),
      constructionYearMin: parseInt(searchParams.get('constructionYearMin') || '0'),
      priceMin: parseInt(searchParams.get('priceMin') || '0'),
      priceMax: parseInt(searchParams.get('priceMax') || '0'),
    };
    setCurrentFilters(filtersFromUrl);
  }, [searchParams]);

  const loadProperties = useCallback(async (filters: typeof currentFilters, page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await getPublishedPropertiesFiltered({
        currency: filters.currency,
        state: filters.state,
        city: filters.city,
        typeProperty: filters.typeProperty,
        operation: filters.operation,
        page: page,
        bedrooms: filters.bedrooms,
        bathrooms: filters.bathrooms,
        parkingSpaces: filters.parkingSpaces,
        bedroomsOperator: filters.bedroomsOperator,
        bathroomsOperator: filters.bathroomsOperator,
        parkingSpacesOperator: filters.parkingSpacesOperator,
        builtSquareMetersMin: filters.builtSquareMetersMin,
        landSquareMetersMin: filters.landSquareMetersMin,
        constructionYearMin: filters.constructionYearMin,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      });

      if (result) {
        setProperties(result.data);
        setPagination(result.pagination);

        // Actualizar URL sin reload
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, val]) => {
          if (val) {
            params.set(key, String(val));
          }
        });
        if (page > 1) {
          params.set('page', page.toString());
        }

        window.history.replaceState(null, '', `?${params.toString()}`);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFiltersChange = useCallback((newFilters: typeof currentFilters) => {
    setCurrentFilters(newFilters);
    loadProperties(newFilters, 1); // Siempre empezar en página 1 cuando cambian filtros
  }, [loadProperties]);

  const handlePageChange = useCallback((newPage: number) => {
    loadProperties(currentFilters, newPage);
  }, [currentFilters, loadProperties]);

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-6 pb-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2 tracking-tight">
          {identity?.name || 'Plataforma Inmobiliaria'}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-light">
          Seleccionamos propiedades con carácter, diseño y alto valor. Te acompañamos con un servicio personalizado y discreto para que encuentres un lugar a la altura de tus expectativas.
        </p>
      </div>

      {/* Sticky filter section - positioned below NavBar */}
      <div className="sticky top-20 md:top-28 z-30 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PropertyFilter initialFilters={currentFilters} onFiltersChange={handleFiltersChange} isLoading={isLoading} />
        </div>
      </div>

      {properties && properties.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <ListProperties
            properties={properties}
            pagination={pagination}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-gray-500 text-lg">No se encontraron propiedades con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}

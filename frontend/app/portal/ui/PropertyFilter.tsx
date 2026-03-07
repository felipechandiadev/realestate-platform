'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Select, { type Option as SelectOption } from '@/shared/components/ui/Select/Select';
import NumberStepper from '@/shared/components/ui/NumberStepper/NumberStepper';
import Switch from '@/shared/components/ui/Switch/Switch';
import { Button } from '@/shared/components/ui/Button/Button';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { getRegions, getCommunesByRegion } from '@/features/shared/locations/actions/locations.action';
import { getPublishedPropertiesFiltered } from '@/features/portal/properties/actions/portalProperties.action';
import { getLatestUfValue } from '@/features/shared/common/actions/uf.action';
import { getPropertyTypesWithFeatures, type PropertyTypeWithFeatures } from '@/features/shared/propertyTypes/actions/propertyTypesFeatures.action';

interface PropertyFilterProps {
  initialFilters?: {
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
  };
  onFiltersChange?: (filters: {
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
  }) => void;
  isLoading?: boolean;
}

export default function PropertyFilter({ initialFilters = {}, onFiltersChange, isLoading = false }: PropertyFilterProps) {
  const currentParams = useSearchParams();
  const [filters, setFilters] = useState({
    operation: initialFilters.operation || '',
    typeProperty: initialFilters.typeProperty || '',
    state: initialFilters.state || '',
    city: initialFilters.city || '',
    currency: initialFilters.currency || '',
    bedrooms: initialFilters.bedrooms || 0,
    bathrooms: initialFilters.bathrooms || 0,
    parkingSpaces: initialFilters.parkingSpaces || 0,
    bedroomsOperator: initialFilters.bedroomsOperator || 'gte' as 'lte' | 'eq' | 'gte',
    bathroomsOperator: initialFilters.bathroomsOperator || 'gte' as 'lte' | 'eq' | 'gte',
    parkingSpacesOperator: initialFilters.parkingSpacesOperator || 'gte' as 'lte' | 'eq' | 'gte',
    builtSquareMetersMin: initialFilters.builtSquareMetersMin || 0,
    landSquareMetersMin: initialFilters.landSquareMetersMin || 0,
    constructionYearMin: initialFilters.constructionYearMin || 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [regions, setRegions] = useState<SelectOption[]>([]);
  const [communes, setCommunes] = useState<SelectOption[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [isLoadingCommunes, setIsLoadingCommunes] = useState(false);
  const [originalRegions, setOriginalRegions] = useState<{id: string, name: string}[]>([]);
  const [currency, setCurrency] = useState<'CLP' | 'UF'>('CLP');
  const [ufValue, setUfValue] = useState<number>(37000); // valor por defecto
  const [propertyTypesFeatures, setPropertyTypesFeatures] = useState<PropertyTypeWithFeatures[]>([]);
  const [selectedPropertyFeatures, setSelectedPropertyFeatures] = useState<PropertyTypeWithFeatures | null>(null);

  // Load property types features on mount
  useEffect(() => {
    const fetchPropertyTypesFeatures = async () => {
      try {
        const types = await getPropertyTypesWithFeatures();
        setPropertyTypesFeatures(types);
      } catch (error) {
        console.error('Error fetching property types features:', error);
      }
    };

    fetchPropertyTypesFeatures();
  }, []);

  // Update selected property features when typeProperty changes
  useEffect(() => {
    if (filters.typeProperty && propertyTypesFeatures.length > 0) {
      const selectedType = propertyTypesFeatures.find(pt => pt.id === filters.typeProperty);
      setSelectedPropertyFeatures(selectedType || null);
    } else {
      setSelectedPropertyFeatures(null);
    }
  }, [filters.typeProperty, propertyTypesFeatures]);

  // Load UF value on mount
  useEffect(() => {
    const fetchUfValue = async () => {
      try {
        const value = await getLatestUfValue();
        if (value && Number.isFinite(value)) {
          setUfValue(value);
        }
      } catch (error) {
        console.error('Error fetching UF value:', error);
      }
    };

    fetchUfValue();
  }, []);

  // Update filters when initialFilters changes
  useEffect(() => {
    setFilters({
      operation: initialFilters.operation || '',
      typeProperty: initialFilters.typeProperty || '',
      state: initialFilters.state || '',
      city: initialFilters.city || '',
      currency: initialFilters.currency || '',
      bedrooms: initialFilters.bedrooms || 0,
      bathrooms: initialFilters.bathrooms || 0,
      parkingSpaces: initialFilters.parkingSpaces || 0,
      bedroomsOperator: initialFilters.bedroomsOperator || 'gte' as 'lte' | 'eq' | 'gte',
      bathroomsOperator: initialFilters.bathroomsOperator || 'gte' as 'lte' | 'eq' | 'gte',
      parkingSpacesOperator: initialFilters.parkingSpacesOperator || 'gte' as 'lte' | 'eq' | 'gte',
      builtSquareMetersMin: initialFilters.builtSquareMetersMin || 0,
      landSquareMetersMin: initialFilters.landSquareMetersMin || 0,
      constructionYearMin: initialFilters.constructionYearMin || 0,
    });
  }, [initialFilters]);

  useEffect(() => {
    const fetchRegions = async () => {
      setIsLoadingRegions(true);
      try {
        const fetchedRegions = await getRegions();
        setOriginalRegions(fetchedRegions);
        // Store regions with their actual names as IDs for filtering
        const regionOptions = fetchedRegions.map((r) => ({ id: r.name, label: r.name }));
        setRegions(regionOptions);
      } catch (error) {
        console.error('Error loading regions:', error);
      } finally {
        setIsLoadingRegions(false);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchCommunes = async () => {
      if (filters.state && originalRegions.length > 0) {
        setIsLoadingCommunes(true);
        try {
          // filters.state now contains the actual region name
          const originalRegion = originalRegions.find(r => r.name === filters.state);
          
          if (originalRegion) {
            const fetchedCommunes = await getCommunesByRegion(originalRegion.id);
            setCommunes(fetchedCommunes.map((c) => ({ id: c.name, label: c.name })));
          }
        } catch (error) {
          console.error('Error loading communes:', error);
        } finally {
          setIsLoadingCommunes(false);
        }
      } else {
        setCommunes([]);
      }
    };
    fetchCommunes();
  }, [filters.state, originalRegions]);

  const handleFilterChange = useCallback((filterName: string, value: string | number | null) => {
    const newFilters = { ...filters, [filterName]: value || (typeof value === 'number' ? value : '') };

    if (filterName === 'state') {
      newFilters.city = '';
    }

    setFilters(newFilters);

    // Informar al componente padre sobre el cambio de filtros
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  }, [filters, onFiltersChange]);

  // Helper function to generate dynamic labels
  const getDynamicLabel = (operator: 'lte' | 'eq' | 'gte', value: number, baseLabel: string): string => {
    if (value === 0) return baseLabel;
    
    switch (operator) {
      case 'lte':
        return `Hasta ${value} ${baseLabel.toLowerCase()}`;
      case 'eq':
        return `${value} ${baseLabel.toLowerCase()}`;
      case 'gte':
        return `Desde ${value} ${baseLabel.toLowerCase()}`;
      default:
        return baseLabel;
    }
  };

  const handleClearFilters = useCallback(() => {
    const clearedFilters = {
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
    };
    
    setFilters(clearedFilters);
    setIsExpanded(false);

    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  }, [onFiltersChange]);

  const operationOptions: SelectOption[] = [
    { id: 'sale', label: 'Venta' },
    { id: 'rent', label: 'Arriendo' },
  ];

  const propertyTypeOptions: SelectOption[] = [
    { id: 'Casa', label: 'Casa' },
    { id: 'Departamento', label: 'Departamento' },
    { id: 'Terreno', label: 'Terreno' },
    { id: 'Local Comercial', label: 'Local Comercial' },
    { id: 'Oficina', label: 'Oficina' },
  ];

  const currencyOptions: SelectOption[] = [
    { id: 'CLP', label: 'Pesos' },
    { id: 'UF', label: 'UF' },
    { id: 'all', label: 'Ambos' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className={`bg-white rounded-lg transition-opacity duration-200 mb-2 ${isLoading ? 'opacity-70' : 'opacity-100'}`}>
        {/* Main filters + actions in one grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-1 gap-y-1 sm:gap-x-2 sm:gap-y-2 lg:gap-4 items-end mb-3 pt-4 pb-3">
          <div className="w-full">
            <Select
              placeholder="Venta/Arriendo"
              options={operationOptions}
              value={filters.operation}
              onChange={(value) => handleFilterChange('operation', value)}
            />
          </div>

          <div className="w-full">
            <Select
              placeholder="Tipo de Propiedad"
              options={propertyTypeOptions}
              value={filters.typeProperty}
              onChange={(value) => handleFilterChange('typeProperty', value)}
            />
          </div>

          <div className="w-full">
            <Select
              placeholder="Región"
              options={regions}
              value={filters.state}
              onChange={(value) => handleFilterChange('state', value)}
            />
          </div>

          <div className="w-full">
            <Select
              placeholder="Comuna"
              options={communes}
              value={filters.city}
              onChange={(value) => handleFilterChange('city', value)}
            />
          </div>

          <div className="w-full">
            <Select
              placeholder="Pesos/UF"
              options={currencyOptions}
              value={filters.currency}
              onChange={(value) => handleFilterChange('currency', value)}
            />
          </div>

          {/* Action buttons as grid item */}
          <div className="flex items-center justify-center gap-2 h-full">
            <IconButton
              icon="close"
              variant="text"
              size="md"
              ariaLabel="Limpiar filtros"
              onClick={handleClearFilters}
              className="p-2"
            />

            {(!selectedPropertyFeatures ||
              selectedPropertyFeatures.hasBedrooms ||
              selectedPropertyFeatures.hasBathrooms ||
              selectedPropertyFeatures.hasParkingSpaces) && (
              <IconButton
                icon="filter_alt"
                variant="text"
                size="md"
                ariaLabel={isExpanded ? 'Cerrar filtros' : 'Más filtros'}
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2"
              />
            )}
          </div>
        </div>

        {/* Expanded filters section - available for all property types */}
        {isExpanded && (
          <div className="pb-2">
            {/* Filtros de características */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
              {/* Dormitorios - only show if property type has bedrooms or no type selected */}
              {(!selectedPropertyFeatures || selectedPropertyFeatures.hasBedrooms) && (
                <div className="w-full">
                  <div className="flex gap-0.5 mb-1">
                    <button
                      onClick={() => handleFilterChange('bedroomsOperator', 'lte')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.bedroomsOperator === 'lte'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ≤
                    </button>
                    <button
                      onClick={() => handleFilterChange('bedroomsOperator', 'eq')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.bedroomsOperator === 'eq'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      =
                    </button>
                    <button
                      onClick={() => handleFilterChange('bedroomsOperator', 'gte')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.bedroomsOperator === 'gte'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ≥
                    </button>
                  </div>
                  <NumberStepper
                    label={getDynamicLabel(filters.bedroomsOperator, filters.bedrooms, 'Dormitorios')}
                    value={filters.bedrooms}
                    onChange={(value) => handleFilterChange('bedrooms', value)}
                    min={0}
                    max={10}
                    hideInput={true}
                  />
                </div>
              )}

              {/* Baños - only show if property type has bathrooms or no type selected */}
              {(!selectedPropertyFeatures || selectedPropertyFeatures.hasBathrooms) && (
                <div className="w-full">
                  <div className="flex gap-0.5 mb-1">
                    <button
                      onClick={() => handleFilterChange('bathroomsOperator', 'lte')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.bathroomsOperator === 'lte'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ≤
                    </button>
                    <button
                      onClick={() => handleFilterChange('bathroomsOperator', 'eq')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.bathroomsOperator === 'eq'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      =
                    </button>
                    <button
                      onClick={() => handleFilterChange('bathroomsOperator', 'gte')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.bathroomsOperator === 'gte'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ≥
                    </button>
                  </div>
                  <NumberStepper
                    label={getDynamicLabel(filters.bathroomsOperator, filters.bathrooms, 'Baños')}
                    value={filters.bathrooms}
                    onChange={(value) => handleFilterChange('bathrooms', value)}
                    min={0}
                    max={10}
                    hideInput={true}
                  />
                </div>
              )}

              {/* Estacionamientos - only show if property type has parking spaces or no type selected */}
              {(!selectedPropertyFeatures || selectedPropertyFeatures.hasParkingSpaces) && (
                <div className="w-full">
                  <div className="flex gap-0.5 mb-1">
                    <button
                      onClick={() => handleFilterChange('parkingSpacesOperator', 'lte')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.parkingSpacesOperator === 'lte'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ≤
                    </button>
                    <button
                      onClick={() => handleFilterChange('parkingSpacesOperator', 'eq')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.parkingSpacesOperator === 'eq'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      =
                    </button>
                    <button
                      onClick={() => handleFilterChange('parkingSpacesOperator', 'gte')}
                      className={`flex-1 px-0.5 py-0.5 text-[8px] lg:text-xs rounded transition-colors ${
                        filters.parkingSpacesOperator === 'gte'
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ≥
                    </button>
                  </div>
                  <NumberStepper
                    label={getDynamicLabel(filters.parkingSpacesOperator, filters.parkingSpaces, 'Estacionamientos')}
                    value={filters.parkingSpaces}
                    onChange={(value) => handleFilterChange('parkingSpaces', value)}
                    min={0}
                    max={10}
                    hideInput={true}
                  />
                </div>
              )}
            </div>


          </div>
        )}
      </div>
    </div>
  );
}

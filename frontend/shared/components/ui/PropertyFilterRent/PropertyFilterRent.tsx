'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlert } from '@/shared/hooks/useAlert';
import Select from '@/shared/components/ui/Select/Select';
import NumberStepper from '@/shared/components/ui/NumberStepper/NumberStepper';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { FilterRentPropertiesDto } from '@/features/portal/properties/actions/rentProperties.action';

interface PropertyFilterRentProps {
  initialFilters?: FilterRentPropertiesDto;
  onFiltersChange?: (filters: FilterRentPropertiesDto) => void;
  className?: string;
}

export default function PropertyFilterRent({
  initialFilters,
  onFiltersChange,
  className = ''
}: PropertyFilterRentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();

  // Initialize filters from initial props or URL params
  const [filters, setFilters] = useState<FilterRentPropertiesDto>(() => {
    const defaults: FilterRentPropertiesDto = {
      typeProperty: '',
      state: '',
      city: '',
      currency: 'CLP',
      page: 1,
      limit: 9,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      bedroomsOperator: 'gte',
      bathroomsOperator: 'gte',
      parkingSpacesOperator: 'gte',
    };

    // If initialFilters are provided, merge with defaults
    if (initialFilters) {
      return { ...defaults, ...initialFilters } as FilterRentPropertiesDto;
    }

    // Otherwise, initialize from URL params (fall back to defaults)
    return {
      ...defaults,
      typeProperty: (searchParams.get('typeProperty') as string) || defaults.typeProperty,
      state: (searchParams.get('state') as string) || defaults.state,
      city: (searchParams.get('city') as string) || defaults.city,
      currency: (searchParams.get('currency') as string) || defaults.currency,
    } as FilterRentPropertiesDto;
  });

  // Helper: dynamic label for stepper buttons
  const getDynamicLabel = (operator: 'lte' | 'eq' | 'gte' | undefined, value: number | undefined, baseLabel: string) => {
    const v = value || 0;
    if (v === 0) return baseLabel;
    switch (operator) {
      case 'lte':
        return `Hasta ${v} ${baseLabel.toLowerCase()}`;
      case 'eq':
        return `${v} ${baseLabel.toLowerCase()}`;
      case 'gte':
      default:
        return `Desde ${v} ${baseLabel.toLowerCase()}`;
    }
  };

  // Update URL when filters change
  const updateURL = useCallback((newFilters: FilterRentPropertiesDto) => {
    const params = new URLSearchParams();

    if (newFilters.typeProperty) {
      params.set('typeProperty', newFilters.typeProperty);
    }
    if (newFilters.state) {
      params.set('state', newFilters.state);
    }
    if (newFilters.city) {
      params.set('city', newFilters.city);
    }
    if (newFilters.currency) {
      params.set('currency', newFilters.currency);
    }

    // Bedrooms / Bathrooms / Parking (include operator when value > 0)
    if (typeof newFilters.bedrooms === 'number' && newFilters.bedrooms > 0) {
      params.set('bedrooms', String(newFilters.bedrooms));
      if (newFilters.bedroomsOperator) params.set('bedroomsOperator', newFilters.bedroomsOperator);
    }
    if (typeof newFilters.bathrooms === 'number' && newFilters.bathrooms > 0) {
      params.set('bathrooms', String(newFilters.bathrooms));
      if (newFilters.bathroomsOperator) params.set('bathroomsOperator', newFilters.bathroomsOperator);
    }
    if (typeof newFilters.parkingSpaces === 'number' && newFilters.parkingSpaces > 0) {
      params.set('parkingSpaces', String(newFilters.parkingSpaces));
      if (newFilters.parkingSpacesOperator) params.set('parkingSpacesOperator', newFilters.parkingSpacesOperator);
    }

    // Always reset to page 1 when filters change
    params.set('page', '1');

    const newUrl = `/portal/properties/rent?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [router]);

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters };
    (newFilters as any)[key] = value;
    newFilters.page = 1;

    setFilters(newFilters);
    updateURL(newFilters);

    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    const clearedFilters: FilterRentPropertiesDto = {
      currency: 'CLP',
      page: 1,
      limit: 9,
      bedrooms: 0,
      bathrooms: 0,
      parkingSpaces: 0,
      bedroomsOperator: 'gte',
      bathroomsOperator: 'gte',
      parkingSpacesOperator: 'gte',
    };

    setFilters(clearedFilters);
    updateURL(clearedFilters);

    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }

    showAlert({
      message: 'Filtros limpiados',
      type: 'info',
      duration: 2000,
    });
  };

  // Property types options
  const propertyTypes = [
    { id: '', label: 'Todos los tipos' },
    { id: 'Casa', label: 'Casa' },
    { id: 'Departamento', label: 'Departamento' },
    { id: 'Oficina', label: 'Oficina' },
    { id: 'Local comercial', label: 'Local comercial' },
    { id: 'Bodega', label: 'Bodega' },
    { id: 'Terreno', label: 'Terreno' },
  ];

  // Regions options - All Chilean regions matching backend enum
  const regions = [
    { id: '', label: 'Todas las regiones' },
    { id: 'Arica y Parinacota', label: 'Arica y Parinacota' },
    { id: 'Tarapacá', label: 'Tarapacá' },
    { id: 'Antofagasta', label: 'Antofagasta' },
    { id: 'Atacama', label: 'Atacama' },
    { id: 'Coquimbo', label: 'Coquimbo' },
    { id: 'Valparaíso', label: 'Valparaíso' },
    { id: 'Metropolitana de Santiago', label: 'Metropolitana de Santiago' },
    { id: "O'Higgins", label: "O'Higgins" },
    { id: 'Maule', label: 'Maule' },
    { id: 'Ñuble', label: 'Ñuble' },
    { id: 'Biobío', label: 'Biobío' },
    { id: 'La Araucanía', label: 'La Araucanía' },
    { id: 'Los Ríos', label: 'Los Ríos' },
    { id: 'Los Lagos', label: 'Los Lagos' },
    { id: 'Aysén', label: 'Aysén' },
    { id: 'Magallanes', label: 'Magallanes' },
  ];

  // Communes options (filtered by selected region)
  const getCommunesForRegion = (region: string) => {
    const communesByRegion: Record<string, { id: string; label: string }[]> = {
      'Metropolitana de Santiago': [
        { id: '', label: 'Todas las comunas' },
        { id: 'Santiago', label: 'Santiago' },
        { id: 'Providencia', label: 'Providencia' },
        { id: 'Las Condes', label: 'Las Condes' },
        { id: 'Vitacura', label: 'Vitacura' },
        { id: 'Ñuñoa', label: 'Ñuñoa' },
        { id: 'La Reina', label: 'La Reina' },
        { id: 'Macul', label: 'Macul' },
        { id: 'Peñalolén', label: 'Peñalolén' },
        { id: 'La Florida', label: 'La Florida' },
        { id: 'Puente Alto', label: 'Puente Alto' },
        { id: 'Maipú', label: 'Maipú' },
        { id: 'La Cisterna', label: 'La Cisterna' },
        { id: 'San Miguel', label: 'San Miguel' },
        { id: 'Quinta Normal', label: 'Quinta Normal' },
        { id: 'Recoleta', label: 'Recoleta' },
        { id: 'Independencia', label: 'Independencia' },
        { id: 'Conchalí', label: 'Conchalí' },
        { id: 'Huechuraba', label: 'Huechuraba' },
        { id: 'Renca', label: 'Renca' },
        { id: 'Cerro Navia', label: 'Cerro Navia' },
        { id: 'Lo Prado', label: 'Lo Prado' },
        { id: 'Pudahuel', label: 'Pudahuel' },
        { id: 'Quilicura', label: 'Quilicura' },
        { id: 'Colina', label: 'Colina' },
        { id: 'Lampa', label: 'Lampa' },
        { id: 'Tiltil', label: 'Tiltil' },
        { id: 'Buin', label: 'Buin' },
        { id: 'Calera de Tango', label: 'Calera de Tango' },
        { id: 'Paine', label: 'Paine' },
        { id: 'Peñaflor', label: 'Peñaflor' },
        { id: 'Talagante', label: 'Talagante' },
        { id: 'El Monte', label: 'El Monte' },
        { id: 'Isla de Maipo', label: 'Isla de Maipo' },
        { id: 'Padre Hurtado', label: 'Padre Hurtado' },
        { id: 'Alhué', label: 'Alhué' },
        { id: 'Curacaví', label: 'Curacaví' },
        { id: 'María Pinto', label: 'María Pinto' },
        { id: 'Melipilla', label: 'Melipilla' },
        { id: 'San Pedro', label: 'San Pedro' },
      ],
      'Valparaíso': [
        { id: '', label: 'Todas las comunas' },
        { id: 'Valparaíso', label: 'Valparaíso' },
        { id: 'Viña del Mar', label: 'Viña del Mar' },
        { id: 'Quilpué', label: 'Quilpué' },
        { id: 'Villa Alemana', label: 'Villa Alemana' },
        { id: 'Concón', label: 'Concón' },
        { id: 'Quintero', label: 'Quintero' },
        { id: 'Puchuncaví', label: 'Puchuncaví' },
        { id: 'Casablanca', label: 'Casablanca' },
        { id: 'Juan Fernández', label: 'Juan Fernández' },
        { id: 'San Antonio', label: 'San Antonio' },
        { id: 'Cartagena', label: 'Cartagena' },
        { id: 'El Tabo', label: 'El Tabo' },
        { id: 'El Quisco', label: 'El Quisco' },
        { id: 'Algarrobo', label: 'Algarrobo' },
        { id: 'Santo Domingo', label: 'Santo Domingo' },
        { id: 'Limache', label: 'Limache' },
        { id: 'Olmué', label: 'Olmué' },
        { id: 'Rinconada', label: 'Rinconada' },
      ],
      'Biobío': [
        { id: '', label: 'Todas las comunas' },
        { id: 'Concepción', label: 'Concepción' },
        { id: 'Talcahuano', label: 'Talcahuano' },
        { id: 'San Pedro de la Paz', label: 'San Pedro de la Paz' },
        { id: 'Penco', label: 'Penco' },
        { id: 'Tomé', label: 'Tomé' },
        { id: 'Hualpén', label: 'Hualpén' },
        { id: 'Chiguayante', label: 'Chiguayante' },
        { id: 'Coronel', label: 'Coronel' },
        { id: 'Lota', label: 'Lota' },
        { id: 'Arauco', label: 'Arauco' },
        { id: 'Cañete', label: 'Cañete' },
        { id: 'Contulmo', label: 'Contulmo' },
        { id: 'Curanilahue', label: 'Curanilahue' },
        { id: 'Lebu', label: 'Lebu' },
        { id: 'Los Álamos', label: 'Los Álamos' },
        { id: 'Tirúa', label: 'Tirúa' },
        { id: 'Los Ángeles', label: 'Los Ángeles' },
        { id: 'Antuco', label: 'Antuco' },
        { id: 'Cabrero', label: 'Cabrero' },
        { id: 'Laja', label: 'Laja' },
        { id: 'Mulchén', label: 'Mulchén' },
        { id: 'Nacimiento', label: 'Nacimiento' },
        { id: 'Negrete', label: 'Negrete' },
        { id: 'Quilaco', label: 'Quilaco' },
        { id: 'Quilleco', label: 'Quilleco' },
        { id: 'San Rosendo', label: 'San Rosendo' },
        { id: 'Santa Bárbara', label: 'Santa Bárbara' },
        { id: 'Tucapel', label: 'Tucapel' },
        { id: 'Yumbel', label: 'Yumbel' },
        { id: 'Alto Biobío', label: 'Alto Biobío' },
        { id: 'Chillán', label: 'Chillán' },
        { id: 'Bulnes', label: 'Bulnes' },
        { id: 'Cobquecura', label: 'Cobquecura' },
        { id: 'Coelemu', label: 'Coelemu' },
        { id: 'Coihueco', label: 'Coihueco' },
        { id: 'Chillán Viejo', label: 'Chillán Viejo' },
        { id: 'El Carmen', label: 'El Carmen' },
        { id: 'Ninhue', label: 'Ninhue' },
        { id: 'Ñiquén', label: 'Ñiquén' },
        { id: 'Pemuco', label: 'Pemuco' },
        { id: 'Pinto', label: 'Pinto' },
        { id: 'Portezuelo', label: 'Portezuelo' },
        { id: 'Quillón', label: 'Quillón' },
        { id: 'Quirihue', label: 'Quirihue' },
        { id: 'Ránquil', label: 'Ránquil' },
        { id: 'San Carlos', label: 'San Carlos' },
        { id: 'San Fabián', label: 'San Fabián' },
        { id: 'San Ignacio', label: 'San Ignacio' },
        { id: 'San Nicolás', label: 'San Nicolás' },
        { id: 'Treguaco', label: 'Treguaco' },
        { id: 'Yungay', label: 'Yungay' },
      ],
    };

    return communesByRegion[region] || [{ id: '', label: region ? 'Comunas no disponibles para esta región' : 'Selecciona una región primero' }];
  };

  const [companyName, setCompanyName] = useState<string | null>(null);
  const [isCharacteristicsExpanded, setIsCharacteristicsExpanded] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadIdentity() {
      try {
        const id = await (await import('@/features/backoffice/cms/actions/identity.action')).getIdentity();
        if (!ignore && id?.name) setCompanyName(id.name);
      } catch (err) {
        // silent - keep default heading
        console.error('PropertyFilterRent: failed to load identity', err);
      }
    }
    loadIdentity();
    return () => { ignore = true; };
  }, []);

  return (
    <div className={`bg-white p-6 rounded-lg ${className}`}>
      <div className="flex items-center justify-end mb-4">
   
        <div className="flex items-center gap-2">
          <IconButton
            icon="filter_alt"
            variant="text"
            className={isCharacteristicsExpanded ? 'text-secondary' : 'text-gray-500'}
            onClick={() => setIsCharacteristicsExpanded(!isCharacteristicsExpanded)}
          />
          <IconButton
            icon="close"
            variant="text"
            color="gray"
            onClick={handleClearFilters}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Property Type */}
        <Select
          placeholder="Tipo de propiedad"
          value={filters.typeProperty || ''}
          onChange={(value) => handleFilterChange('typeProperty', value)}
          options={propertyTypes}
        />

        {/* Region */}
        <Select
          placeholder="Región"
          value={filters.state || ''}
          onChange={(value) => {
            // Update both state and clear city in a single state update
            const newFilters = { ...filters };
            newFilters.state = value === null ? undefined : String(value);
            newFilters.city = ''; // Clear commune when region changes
            newFilters.page = 1;

            setFilters(newFilters);
            updateURL(newFilters);

            if (onFiltersChange) {
              onFiltersChange(newFilters);
            }
          }}
          options={regions}
        />

        {/* Commune */}
        <Select
          placeholder="Comuna"
          value={filters.city || ''}
          onChange={(value) => handleFilterChange('city', value)}
          options={getCommunesForRegion(filters.state || '')}
        />

        {/* Currency */}
        <Select
          placeholder="Moneda"
          value={filters.currency || 'CLP'}
          onChange={(value) => handleFilterChange('currency', value)}
          options={[
            { id: 'CLP', label: 'CLP' },
            { id: 'UF', label: 'UF' },
          ]}
        />
      </div>

      {isCharacteristicsExpanded && (
        <div className="mt-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Bedrooms */}
            <div>
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => handleFilterChange('bedroomsOperator', 'lte')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.bedroomsOperator === 'lte' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ≤
                </button>
                <button
                  onClick={() => handleFilterChange('bedroomsOperator', 'eq')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.bedroomsOperator === 'eq' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  =
                </button>
                <button
                  onClick={() => handleFilterChange('bedroomsOperator', 'gte')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.bedroomsOperator === 'gte' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ≥
                </button>
              </div>
              <NumberStepper
                label={getDynamicLabel(filters.bedroomsOperator as any, filters.bedrooms || 0, 'Dormitorios')}
                value={filters.bedrooms || 0}
                onChange={(value) => handleFilterChange('bedrooms', value)}
                min={0}
                max={10}
                hideInput={true}
              />
            </div>

            {/* Bathrooms */}
            <div>
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => handleFilterChange('bathroomsOperator', 'lte')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.bathroomsOperator === 'lte' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ≤
                </button>
                <button
                  onClick={() => handleFilterChange('bathroomsOperator', 'eq')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.bathroomsOperator === 'eq' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  =
                </button>
                <button
                  onClick={() => handleFilterChange('bathroomsOperator', 'gte')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.bathroomsOperator === 'gte' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ≥
                </button>
              </div>
              <NumberStepper
                label={getDynamicLabel(filters.bathroomsOperator as any, filters.bathrooms || 0, 'Baños')}
                value={filters.bathrooms || 0}
                onChange={(value) => handleFilterChange('bathrooms', value)}
                min={0}
                max={10}
                hideInput={true}
              />
            </div>

            {/* Parking */}
            <div>
              <div className="flex gap-1 mb-1">
                <button
                  onClick={() => handleFilterChange('parkingSpacesOperator', 'lte')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.parkingSpacesOperator === 'lte' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ≤
                </button>
                <button
                  onClick={() => handleFilterChange('parkingSpacesOperator', 'eq')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.parkingSpacesOperator === 'eq' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  =
                </button>
                <button
                  onClick={() => handleFilterChange('parkingSpacesOperator', 'gte')}
                  className={`flex-1 px-2 py-0.5 text-xs rounded transition-colors ${
                    filters.parkingSpacesOperator === 'gte' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ≥
                </button>
              </div>
              <NumberStepper
                label={getDynamicLabel(filters.parkingSpacesOperator as any, filters.parkingSpaces || 0, 'Estacionamientos')}
                value={filters.parkingSpaces || 0}
                onChange={(value) => handleFilterChange('parkingSpaces', value)}
                min={0}
                max={10}
                hideInput={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
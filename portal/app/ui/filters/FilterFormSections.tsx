'use client';

import React, { useEffect, useState } from 'react';
import { Select, type Option as SelectOption, OTHER_FEATURE_OPTIONS, type OtherFeatureKey } from '@realestate/ui';
import { getRegions, getCommunesByRegion } from '@/features/shared/locations/actions/locations.action';
import {
  getPropertyTypesWithFeatures,
  type PropertyTypeWithFeatures,
} from '@/features/shared/propertyTypes/actions/propertyTypesFeatures.action';
import type { PropertyFiltersState } from './filter-types';

type Props = {
  filters: PropertyFiltersState;
  onChange: (patch: Partial<PropertyFiltersState>) => void;
  openSections?: Record<string, boolean>;
};

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-foreground hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}

function Accordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-foreground"
      >
        {title}
        <span className="text-muted-foreground">{open ? '−' : '+'}</span>
      </button>
      {open ? <div className="space-y-3 pb-4">{children}</div> : null}
    </div>
  );
}

export default function FilterFormSections({ filters, onChange }: Props) {
  const [regions, setRegions] = useState<SelectOption[]>([]);
  const [originalRegions, setOriginalRegions] = useState<{ id: string; name: string }[]>([]);
  const [communes, setCommunes] = useState<SelectOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeWithFeatures[]>([]);
  const [open, setOpen] = useState({
    operation: true,
    location: true,
    price: true,
    distribution: true,
    surface: false,
    features: false,
  });

  useEffect(() => {
    getRegions()
      .then((list) => {
        const rows = list || [];
        setOriginalRegions(rows);
        setRegions(rows.map((r: { id: string; name: string }) => ({ id: r.name, label: r.name })));
      })
      .catch(() => setRegions([]));
    getPropertyTypesWithFeatures()
      .then(setPropertyTypes)
      .catch(() => setPropertyTypes([]));
  }, []);

  useEffect(() => {
    if (!filters.state || originalRegions.length === 0) {
      setCommunes([]);
      return;
    }
    const region = originalRegions.find((r) => r.name === filters.state);
    if (!region) {
      setCommunes([]);
      return;
    }
    getCommunesByRegion(region.id)
      .then((list) =>
        setCommunes(
          (list || []).map((c: { id: string; name: string }) => ({ id: c.name, label: c.name })),
        ),
      )
      .catch(() => setCommunes([]));
  }, [filters.state, originalRegions]);

  const toggleType = (id: string) => {
    const next = filters.typeIds.includes(id)
      ? filters.typeIds.filter((t) => t !== id)
      : [...filters.typeIds, id];
    onChange({ typeIds: next, typeProperty: '' });
  };

  const toggleFeature = (key: OtherFeatureKey) => {
    const next = filters.otherFeatures.includes(key)
      ? filters.otherFeatures.filter((f) => f !== key)
      : [...filters.otherFeatures, key];
    onChange({ otherFeatures: next });
  };

  const setBedroomChip = (value: number) => {
    if (filters.bedrooms === value && filters.bedroomsOperator === (value >= 4 ? 'gte' : 'eq')) {
      onChange({ bedrooms: 0, bedroomsOperator: 'gte' });
      return;
    }
    onChange({
      bedrooms: value,
      bedroomsOperator: value >= 4 ? 'gte' : 'eq',
    });
  };

  const setBathroomChip = (value: number) => {
    if (filters.bathrooms === value && filters.bathroomsOperator === (value >= 3 ? 'gte' : 'eq')) {
      onChange({ bathrooms: 0, bathroomsOperator: 'gte' });
      return;
    }
    onChange({
      bathrooms: value,
      bathroomsOperator: value >= 3 ? 'gte' : 'eq',
    });
  };

  return (
    <div className="space-y-1">
      <Accordion
        title="Operación"
        open={open.operation}
        onToggle={() => setOpen((s) => ({ ...s, operation: !s.operation }))}
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: '', label: 'Todas' },
            { id: 'sale', label: 'En Venta' },
            { id: 'rent', label: 'En Arriendo' },
          ].map((op) => (
            <Chip
              key={op.id || 'all'}
              label={op.label}
              active={filters.operation === op.id}
              onClick={() => onChange({ operation: op.id })}
            />
          ))}
        </div>
        <div className="space-y-2 pt-2">
          <p className="text-xs font-medium text-muted-foreground">Tipo de propiedad</p>
          <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto">
            {propertyTypes.map((pt) => (
              <label key={pt.id} className="flex items-center gap-2 text-xs text-foreground">
                <input
                  type="checkbox"
                  checked={filters.typeIds.includes(pt.id)}
                  onChange={() => toggleType(pt.id)}
                />
                {pt.name}
              </label>
            ))}
          </div>
        </div>
      </Accordion>

      <Accordion
        title="Ubicación"
        open={open.location}
        onToggle={() => setOpen((s) => ({ ...s, location: !s.location }))}
      >
        <Select
          placeholder="Región"
          options={regions}
          value={filters.state}
          onChange={(value) => onChange({ state: String(value || ''), city: '' })}
        />
        <Select
          placeholder="Comuna"
          options={communes}
          value={filters.city}
          onChange={(value) => onChange({ city: String(value || '') })}
        />
      </Accordion>

      <Accordion
        title="Precio"
        open={open.price}
        onToggle={() => setOpen((s) => ({ ...s, price: !s.price }))}
      >
        <div className="flex flex-wrap gap-2">
          {[
            { id: '', label: 'Ambas' },
            { id: 'CLP', label: 'CLP $' },
            { id: 'UF', label: 'UF' },
          ].map((c) => (
            <Chip
              key={c.id || 'all-cur'}
              label={c.label}
              active={filters.currency === c.id}
              onClick={() => onChange({ currency: c.id })}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Mínimo</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              value={filters.priceMin || ''}
              onChange={(e) => onChange({ priceMin: Number(e.target.value) || 0 })}
            />
          </label>
          <label className="space-y-1 text-xs">
            <span className="text-muted-foreground">Máximo</span>
            <input
              type="number"
              min={0}
              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
              value={filters.priceMax || ''}
              onChange={(e) => onChange({ priceMax: Number(e.target.value) || 0 })}
            />
          </label>
        </div>
        {(filters.priceMin > 0 || filters.priceMax > 0) && (
          <input
            type="range"
            min={filters.priceMin || 0}
            max={Math.max(filters.priceMax || filters.priceMin || 1, filters.priceMin || 1)}
            value={filters.priceMax || filters.priceMin || 0}
            onChange={(e) => onChange({ priceMax: Number(e.target.value) || 0 })}
            className="w-full"
            aria-label="Ajustar precio máximo"
          />
        )}
      </Accordion>

      <Accordion
        title="Distribución"
        open={open.distribution}
        onToggle={() => setOpen((s) => ({ ...s, distribution: !s.distribution }))}
      >
        <p className="text-xs text-muted-foreground">Dormitorios</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((n) => (
            <Chip
              key={`bed-${n}`}
              label={n === 4 ? '4+' : String(n)}
              active={
                filters.bedrooms === n &&
                (n >= 4 ? filters.bedroomsOperator === 'gte' : filters.bedroomsOperator === 'eq')
              }
              onClick={() => setBedroomChip(n)}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Baños</p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((n) => (
            <Chip
              key={`bath-${n}`}
              label={n === 3 ? '3+' : String(n)}
              active={
                filters.bathrooms === n &&
                (n >= 3 ? filters.bathroomsOperator === 'gte' : filters.bathroomsOperator === 'eq')
              }
              onClick={() => setBathroomChip(n)}
            />
          ))}
        </div>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">Estacionamientos (mín.)</span>
          <input
            type="number"
            min={0}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={filters.parkingSpaces || ''}
            onChange={(e) =>
              onChange({
                parkingSpaces: Number(e.target.value) || 0,
                parkingSpacesOperator: 'gte',
              })
            }
          />
        </label>
      </Accordion>

      <Accordion
        title="Superficie"
        open={open.surface}
        onToggle={() => setOpen((s) => ({ ...s, surface: !s.surface }))}
      >
        <p className="text-xs font-medium text-muted-foreground">m² útiles (construidos)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={filters.builtSquareMetersMin || ''}
            onChange={(e) => onChange({ builtSquareMetersMin: Number(e.target.value) || 0 })}
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={filters.builtSquareMetersMax || ''}
            onChange={(e) => onChange({ builtSquareMetersMax: Number(e.target.value) || 0 })}
          />
        </div>
        <p className="text-xs font-medium text-muted-foreground">m² totales (terreno)</p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={filters.landSquareMetersMin || ''}
            onChange={(e) => onChange({ landSquareMetersMin: Number(e.target.value) || 0 })}
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={filters.landSquareMetersMax || ''}
            onChange={(e) => onChange({ landSquareMetersMax: Number(e.target.value) || 0 })}
          />
        </div>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">Año construcción (mín.)</span>
          <input
            type="number"
            min={0}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            value={filters.constructionYearMin || ''}
            onChange={(e) => onChange({ constructionYearMin: Number(e.target.value) || 0 })}
          />
        </label>
      </Accordion>

      <Accordion
        title="Otras características"
        open={open.features}
        onToggle={() => setOpen((s) => ({ ...s, features: !s.features }))}
      >
        <div className="flex flex-col gap-1.5">
          {OTHER_FEATURE_OPTIONS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={filters.otherFeatures.includes(opt.key)}
                onChange={() => toggleFeature(opt.key)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Accordion>
    </div>
  );
}

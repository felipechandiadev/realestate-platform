'use client';

import React, { useEffect, useState } from 'react';
import {
  Select,
  type Option as SelectOption,
  OTHER_FEATURE_OPTIONS,
  type OtherFeatureKey,
  RangeSlider,
} from '@realestate/ui';
import { getRegions, getCommunesByRegion } from '@/features/shared/locations/actions/locations.action';
import {
  getPropertyTypesWithFeatures,
  type PropertyTypeWithFeatures,
} from '@/features/shared/propertyTypes/actions/propertyTypesFeatures.action';
import {
  getFilterBounds,
  type FilterBounds,
} from '@/features/properties/actions/portalProperties.action';
import type { PropertyFiltersState } from './filter-types';

type Props = {
  filters: PropertyFiltersState;
  onChange: (patch: Partial<PropertyFiltersState>) => void;
  openSections?: Record<string, boolean>;
  /** When set (sale/rent pages), other operation chips are disabled. */
  lockedOperation?: 'sale' | 'rent';
};

function formatPrice(value: number, currency: string): string {
  if (currency === 'UF') {
    return `UF ${value.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`;
  }
  return `$ ${Math.round(value).toLocaleString('es-CL')}`;
}

function priceStep(currency: string, min: number, max: number): number {
  const span = Math.max(max - min, 1);
  if (currency === 'UF') {
    if (span <= 100) return 1;
    if (span <= 1000) return 5;
    return 10;
  }
  if (span <= 5_000_000) return 50_000;
  if (span <= 50_000_000) return 100_000;
  return 500_000;
}

function surfaceStep(min: number, max: number): number {
  const span = Math.max(max - min, 1);
  if (span <= 100) return 1;
  if (span <= 500) return 5;
  return 10;
}

/** When filter is unset (0), treat as full bounds for the slider display. */
function sliderValue(
  minFilter: number,
  maxFilter: number,
  boundMin: number,
  boundMax: number,
): [number, number] {
  const lo = minFilter > 0 ? Math.max(boundMin, minFilter) : boundMin;
  const hi = maxFilter > 0 ? Math.min(boundMax, maxFilter) : boundMax;
  return [Math.min(lo, hi), Math.max(lo, hi)];
}

function rangePatch(
  next: [number, number],
  boundMin: number,
  boundMax: number,
): { min: number; max: number } {
  const atFull = next[0] <= boundMin && next[1] >= boundMax;
  if (atFull) return { min: 0, max: 0 };
  return { min: next[0], max: next[1] };
}

function Chip({
  label,
  active,
  onClick,
  disabled = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
        disabled
          ? 'cursor-not-allowed border-border bg-muted/50 text-muted-foreground opacity-50'
          : active
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

export default function FilterFormSections({ filters, onChange, lockedOperation }: Props) {
  const [regions, setRegions] = useState<SelectOption[]>([]);
  const [originalRegions, setOriginalRegions] = useState<{ id: string; name: string }[]>([]);
  const [communes, setCommunes] = useState<SelectOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeWithFeatures[]>([]);
  const [bounds, setBounds] = useState<FilterBounds | null>(null);
  const [open, setOpen] = useState({
    operation: true,
    location: true,
    price: true,
    distribution: true,
    surface: false,
    features: false,
  });

  const currencyForBounds = filters.currency || 'CLP';

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
    let cancelled = false;
    getFilterBounds({
      operation: filters.operation || undefined,
      currency: currencyForBounds,
    }).then((data) => {
      if (!cancelled) setBounds(data);
    });
    return () => {
      cancelled = true;
    };
  }, [filters.operation, currencyForBounds]);

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
          ].map((op) => {
            const disabled = Boolean(lockedOperation && op.id !== lockedOperation);
            return (
              <Chip
                key={op.id || 'all'}
                label={op.label}
                active={filters.operation === op.id}
                disabled={disabled}
                onClick={() => {
                  if (disabled) return;
                  onChange({ operation: op.id });
                }}
              />
            );
          })}
        </div>
        {lockedOperation ? (
          <p className="text-[11px] text-muted-foreground">
            Operación fijada en esta página ({lockedOperation === 'rent' ? 'Arriendo' : 'Venta'}).
          </p>
        ) : null}
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
              onClick={() => onChange({ currency: c.id, priceMin: 0, priceMax: 0 })}
            />
          ))}
        </div>
        {bounds ? (
          (() => {
            const pMin = bounds.price.min;
            const pMax = bounds.price.max;
            const [lo, hi] = sliderValue(filters.priceMin, filters.priceMax, pMin, pMax);
            const step = priceStep(currencyForBounds, pMin, pMax);
            return (
              <div className="space-y-2" data-test-id="filter-price-range">
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(lo, currencyForBounds)} – {formatPrice(hi, currencyForBounds)}
                  {hi >= pMax ? '+' : ''}
                </p>
                <RangeSlider
                  min={pMin}
                  max={pMax}
                  step={step}
                  value={[lo, hi]}
                  label=""
                  hideValues
                  onChange={([minV, maxV]) => {
                    const patch = rangePatch([minV, maxV], pMin, pMax);
                    onChange({
                      priceMin: patch.min,
                      priceMax: patch.max,
                      ...(filters.currency ? {} : { currency: currencyForBounds }),
                    });
                  }}
                />
              </div>
            );
          })()
        ) : (
          <p className="text-xs text-muted-foreground">Cargando rango de precios…</p>
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
        {bounds ? (
          <>
            <div className="space-y-2" data-test-id="filter-built-range">
              <p className="text-xs font-medium text-muted-foreground">m² útiles (construidos)</p>
              {(() => {
                const bMin = bounds.builtSquareMeters.min;
                const bMax = bounds.builtSquareMeters.max;
                const [lo, hi] = sliderValue(
                  filters.builtSquareMetersMin,
                  filters.builtSquareMetersMax,
                  bMin,
                  bMax,
                );
                return (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {Math.round(lo)} – {Math.round(hi)} m²
                      {hi >= bMax ? '+' : ''}
                    </p>
                    <RangeSlider
                      min={bMin}
                      max={bMax}
                      step={surfaceStep(bMin, bMax)}
                      value={[lo, hi]}
                      label=""
                      hideValues
                      onChange={([minV, maxV]) => {
                        const patch = rangePatch([minV, maxV], bMin, bMax);
                        onChange({
                          builtSquareMetersMin: patch.min,
                          builtSquareMetersMax: patch.max,
                        });
                      }}
                    />
                  </>
                );
              })()}
            </div>
            <div className="space-y-2" data-test-id="filter-land-range">
              <p className="text-xs font-medium text-muted-foreground">m² totales (terreno)</p>
              {(() => {
                const lMin = bounds.landSquareMeters.min;
                const lMax = bounds.landSquareMeters.max;
                const [lo, hi] = sliderValue(
                  filters.landSquareMetersMin,
                  filters.landSquareMetersMax,
                  lMin,
                  lMax,
                );
                return (
                  <>
                    <p className="text-sm font-semibold text-foreground">
                      {Math.round(lo)} – {Math.round(hi)} m²
                      {hi >= lMax ? '+' : ''}
                    </p>
                    <RangeSlider
                      min={lMin}
                      max={lMax}
                      step={surfaceStep(lMin, lMax)}
                      value={[lo, hi]}
                      label=""
                      hideValues
                      onChange={([minV, maxV]) => {
                        const patch = rangePatch([minV, maxV], lMin, lMax);
                        onChange({
                          landSquareMetersMin: patch.min,
                          landSquareMetersMax: patch.max,
                        });
                      }}
                    />
                  </>
                );
              })()}
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Cargando rangos de superficie…</p>
        )}
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

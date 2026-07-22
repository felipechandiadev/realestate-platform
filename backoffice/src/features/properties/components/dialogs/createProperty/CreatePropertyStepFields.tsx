'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import { TextField, AutoComplete, Select, Switch, RangeSlider } from '@realestate/ui';
import { LocationPickerWrapper as CreateLocationPicker } from '@realestate/ui/components/LocationPicker';
import { MultimediaUploader } from '@/shared/components/ui/FileUploader/MultimediaUploader';
import type { BaseFormField } from '@/shared/components/ui/BaseForm/StepperBaseForm';

type FormValues = Record<string, unknown>;

export type CreatePropertyStepFieldsProps = {
  fieldRows: BaseFormField[][];
  values: FormValues;
  onChange: (field: string, value: unknown) => void;
};

type LocationFieldProps = {
  onChangeCallback: (coords: { lat: number; lng: number } | null) => void;
  initialLat?: number;
  initialLng?: number;
  mode?: 'viewer' | 'edit' | 'update';
  height?: number;
};

const LocationField = React.memo(function LocationField({
  onChangeCallback,
  initialLat,
  initialLng,
  mode = 'edit',
  height,
}: LocationFieldProps) {
  return (
    <CreateLocationPicker
      onChange={onChangeCallback}
      initialLat={initialLat}
      initialLng={initialLng}
      mode={mode}
      height={height}
    />
  );
});

export function CreatePropertyStepFields({
  fieldRows,
  values,
  onChange,
}: CreatePropertyStepFieldsProps) {
  const coordHandlersRef = useRef<
    Map<string, (coords: { lat: number; lng: number } | null) => void>
  >(new Map());

  const getCoordHandler = useCallback(
    (name: string) => {
      const existing = coordHandlersRef.current.get(name);
      if (existing) return existing;
      const handler = (coords: { lat: number; lng: number } | null) => onChange(name, coords);
      coordHandlersRef.current.set(name, handler);
      return handler;
    },
    [onChange],
  );

  const renderField = useCallback(
    (field: BaseFormField) => {
      const fieldValue = values[field.name];
      const commonProps = (field.props ?? {}) as Record<string, unknown>;

      if (field.type === 'custom' && field.renderComponent) {
        return (
          <div key={field.name}>
            {field.renderComponent({
              name: field.name,
              label: field.label,
              value: fieldValue,
              onChange: (value: unknown) => onChange(field.name, value),
              field,
              values,
            })}
          </div>
        );
      }

      if (field.type === 'location') {
        const locationProps = commonProps as {
          initialLat?: number;
          initialLng?: number;
          mode?: 'viewer' | 'edit' | 'update';
          height?: number;
        };

        return (
          <div key={field.name} className="min-h-[200px] w-full">
            <LocationField
              onChangeCallback={getCoordHandler(field.name)}
              initialLat={locationProps.initialLat}
              initialLng={locationProps.initialLng}
              mode={locationProps.mode ?? 'edit'}
              height={locationProps.height}
            />
          </div>
        );
      }

      if (field.type === 'multimedia') {
        const multimediaValue = Array.isArray(fieldValue) ? (fieldValue as File[]) : [];
        const rawProps = field.props ?? {};
        const { label: customLabel, ...rest } = rawProps as Record<string, unknown> & {
          label?: string;
        };
        const typedProps = rest as {
          uploadPath?: string;
          accept?: string;
          maxFiles?: number;
          maxSize?: number;
          aspectRatio?: 'square' | 'video' | 'auto';
          buttonType?: 'icon' | 'normal';
          variant?: 'default' | 'avatar';
          previewSize?: 'xs' | 'sm' | 'normal' | 'lg' | 'xl';
        };

        return (
          <div key={field.name} className="flex flex-col gap-2">
            {(customLabel ?? field.label) && (
              <span className="text-sm font-medium text-foreground">
                {(customLabel as string | undefined) ?? field.label}
              </span>
            )}
            <MultimediaUploader
              uploadPath={typedProps.uploadPath ?? '/uploads/media'}
              label={(customLabel as string | undefined) ?? field.label}
              accept={typedProps.accept ?? 'image/*,video/*'}
              maxFiles={typedProps.maxFiles}
              maxSize={typedProps.maxSize}
              aspectRatio={typedProps.aspectRatio}
              buttonType={typedProps.buttonType}
              variant={typedProps.variant}
              previewSize={typedProps.previewSize}
              onChange={(files: File[]) => onChange(field.name, files)}
            />
            {multimediaValue.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {multimediaValue.map((file, idx) => (
                  <li key={`${file.name}-${idx}`}>
                    • {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }

      if (field.type === 'range') {
        const rangeValue = Array.isArray(fieldValue)
          ? (fieldValue.slice(0, 2) as [number, number])
          : undefined;

        return (
          <div key={field.name}>
            <RangeSlider
              min={field.min ?? 0}
              max={field.max ?? 100}
              value={rangeValue}
              onChange={(val) => onChange(field.name, val)}
              {...commonProps}
            />
          </div>
        );
      }

      if (field.type === 'select') {
        let selectValue: string | number | null = null;
        if (typeof fieldValue === 'string' || typeof fieldValue === 'number') {
          selectValue = fieldValue;
        } else if (fieldValue && typeof fieldValue === 'object' && 'id' in fieldValue) {
          const id = (fieldValue as { id: unknown }).id;
          if (typeof id === 'string' || typeof id === 'number') {
            selectValue = id;
          }
        }

        return (
          <div key={field.name}>
            <Select
              options={field.options || []}
              placeholder={field.label}
              value={selectValue ?? undefined}
              onChange={(id: string | number | null) => onChange(field.name, id)}
              required={field.required}
              data-test-id={`select-${field.name}`}
              {...commonProps}
            />
          </div>
        );
      }

      if (field.type === 'autocomplete') {
        const optionId =
          typeof fieldValue === 'string' || typeof fieldValue === 'number'
            ? fieldValue
            : undefined;
        const selectedOption =
          optionId !== undefined
            ? field.options?.find((opt) => opt.id === optionId) ?? null
            : null;

        return (
          <div key={field.name}>
            <AutoComplete
              options={field.options || []}
              label={field.label}
              value={selectedOption}
              onChange={(opt) => onChange(field.name, opt ? opt.id : null)}
              required={field.required}
              name={field.name}
              data-test-id={`autocomplete-${field.name}`}
              {...commonProps}
            />
          </div>
        );
      }

      if (field.type === 'switch') {
        return (
          <div key={field.name}>
            <Switch
              checked={Boolean(fieldValue)}
              onChange={(val) => onChange(field.name, val)}
              label={field.label}
              labelPosition={field.labelPosition}
              data-test-id={`switch-${field.name}`}
              {...commonProps}
            />
          </div>
        );
      }

      if (field.type === 'currency') {
        const typedProps = (field.props ?? {}) as {
          currencyField?: string;
          currencies?: Array<{ id: string; symbol: string; label: string }>;
        };
        const currencyField = typedProps.currencyField;
        const currencies = typedProps.currencies || [];
        const currentCurrency = currencyField ? values[currencyField] : 'CLP';
        const currencySymbol =
          currencies.find((c) => c.id === currentCurrency)?.symbol || '$';

        return (
          <div key={field.name}>
            <TextField
              label={field.label}
              value={String(fieldValue || '')}
              onChange={(event) => {
                onChange(field.name, event.target.value);
              }}
              type="currency"
              name={field.name}
              required={field.required}
              currencySymbol={currencySymbol}
              currencyField={currencyField}
              currencies={currencies}
              data-test-id={`currency-${field.name}`}
              {...commonProps}
              {...(field.props || {})}
            />
          </div>
        );
      }

      if (field.type === 'number') {
        const stringValue = (() => {
          if (typeof fieldValue === 'number' && Number.isFinite(fieldValue)) {
            return String(fieldValue);
          }
          if (typeof fieldValue === 'string') {
            return fieldValue;
          }
          return '';
        })();

        return (
          <div key={field.name}>
            <TextField
              label={field.label}
              value={stringValue}
              onChange={(event) => {
                const rawValue = event.target.value;
                if (rawValue === '') {
                  onChange(field.name, '');
                  return;
                }
                const parsed = Number(rawValue);
                onChange(field.name, Number.isFinite(parsed) ? parsed : '');
              }}
              type="number"
              name={field.name}
              required={field.required}
              startIcon={field.startIcon}
              endIcon={field.endIcon}
              data-test-id={`input-${field.name}`}
              {...commonProps}
            />
          </div>
        );
      }

      const resolvedValue = (() => {
        if (typeof fieldValue === 'string') return fieldValue;
        if (typeof fieldValue === 'number') return String(fieldValue);
        if (fieldValue === undefined || fieldValue === null) return '';
        return String(fieldValue);
      })();

      const inputType = field.type === 'textarea' ? 'textarea' : field.type;

      return (
        <div key={field.name}>
          <TextField
            label={field.label}
            value={resolvedValue}
            onChange={(event) =>
              onChange(
                field.name,
                field.formatFn ? field.formatFn(event.target.value) : event.target.value,
              )
            }
            type={inputType}
            name={field.name}
            rows={field.type === 'textarea' || field.multiline ? field.rows : undefined}
            startIcon={field.startIcon}
            endIcon={field.endIcon}
            required={field.required}
            data-test-id={`input-${field.name}`}
            {...commonProps}
          />
        </div>
      );
    },
    [getCoordHandler, onChange, values],
  );

  const rows = useMemo(() => fieldRows, [fieldRows]);

  return (
    <div className="flex w-full flex-col gap-3">
      {rows.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex w-full items-start gap-2">
          {row.map((field) => (
            <div
              key={field.name}
              className="min-w-0 flex-grow"
              style={{
                width: field.width ?? 'auto',
                flexBasis: field.width ?? 'auto',
              }}
            >
              {renderField(field)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function isFieldValueEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id;
    return id === undefined || id === null || id === '';
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'lat' in value &&
    'lng' in value
  ) {
    const coords = value as { lat?: unknown; lng?: unknown };
    return coords.lat == null || coords.lng == null;
  }
  return false;
}

export function validateRequiredFields(
  fieldRows: BaseFormField[][],
  values: FormValues,
): string | null {
  const requiredFields = fieldRows.flat().filter((field) => field.required);
  const missing = requiredFields.filter((field) =>
    isFieldValueEmpty(values[field.name]),
  );
  if (missing.length === 0) return null;
  return `Complete los campos requeridos: ${missing.map((f) => f.label || f.name).join(', ')}`;
}

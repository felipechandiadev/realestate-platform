'use client';

import { useState } from 'react';
import {
  Button,
  OtherFeaturesChips,
  OtherFeaturesPickerDialog,
  normalizeOtherFeatures,
  type OtherFeatureKey,
} from '@realestate/ui';

type OtherFeaturesFieldProps = {
  value: unknown;
  onChange: (value: OtherFeatureKey[]) => void;
};

export default function OtherFeaturesField({ value, onChange }: OtherFeaturesFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = normalizeOtherFeatures(value);

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">Otras características</p>
          <p className="text-xs text-muted-foreground">
            Opcional. Selecciona amenities adicionales o ninguna.
          </p>
        </div>
        <Button type="button" variant="outlined" onClick={() => setOpen(true)}>
          Seleccionar
        </Button>
      </div>
      <OtherFeaturesChips value={selected} />
      <OtherFeaturesPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        value={selected}
        onApply={(keys) => onChange(keys)}
      />
    </div>
  );
}

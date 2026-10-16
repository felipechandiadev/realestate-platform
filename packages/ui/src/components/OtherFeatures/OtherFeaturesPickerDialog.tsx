'use client';

import React, { useEffect, useState } from 'react';
import Dialog from '../Dialog/Dialog';
import { Button } from '../Button';
import { Badge } from '../Badge';
import {
  OTHER_FEATURE_OPTIONS,
  normalizeOtherFeatures,
  type OtherFeatureKey,
} from '../../property/other-features';

export type OtherFeaturesPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  value?: string[];
  onApply: (keys: OtherFeatureKey[]) => void;
  title?: string;
};

export function OtherFeaturesPickerDialog({
  open,
  onClose,
  value = [],
  onApply,
  title = 'Otras características',
}: OtherFeaturesPickerDialogProps) {
  const [selected, setSelected] = useState<OtherFeatureKey[]>(() => normalizeOtherFeatures(value));

  useEffect(() => {
    if (open) {
      setSelected(normalizeOtherFeatures(value));
    }
  }, [open, value]);

  const toggle = (key: OtherFeatureKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : normalizeOtherFeatures([...prev, key]),
    );
  };

  const clearAll = () => setSelected([]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      showCloseButton
      actionsJustify="between"
      actions={
        <>
          <Button type="button" variant="outlined" onClick={clearAll}>
            Sin otras características
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onApply(selected);
                onClose();
              }}
            >
              Aplicar
            </Button>
          </div>
        </>
      }
    >
      <p className="text-sm text-muted-foreground mb-4">
        Selecciona las características adicionales de la propiedad. Puedes dejar ninguna.
      </p>
      <div className="flex flex-wrap gap-2">
        {OTHER_FEATURE_OPTIONS.map(({ key, label }) => {
          const active = selected.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className="cursor-pointer border-0 bg-transparent p-0"
              aria-pressed={active}
            >
              <Badge variant={active ? 'primary' : 'primary-outlined'}>{label}</Badge>
            </button>
          );
        })}
      </div>
    </Dialog>
  );
}

export default OtherFeaturesPickerDialog;

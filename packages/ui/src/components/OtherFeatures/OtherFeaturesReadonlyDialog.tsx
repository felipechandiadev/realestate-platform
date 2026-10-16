'use client';

import React from 'react';
import Dialog from '../Dialog/Dialog';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { labelsForOtherFeatures, normalizeOtherFeatures } from '../../property/other-features';

export type OtherFeaturesReadonlyDialogProps = {
  open: boolean;
  onClose: () => void;
  value?: string[];
  title?: string;
};

export function OtherFeaturesReadonlyDialog({
  open,
  onClose,
  value = [],
  title = 'Otras características',
}: OtherFeaturesReadonlyDialogProps) {
  const keys = normalizeOtherFeatures(value);
  const labels = labelsForOtherFeatures(keys);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton
      actionsJustify="end"
      actions={
        <Button type="button" variant="primary" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      {labels.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin otras características</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <Badge key={label} variant="primary-outlined">
              {label}
            </Badge>
          ))}
        </div>
      )}
    </Dialog>
  );
}

export default OtherFeaturesReadonlyDialog;

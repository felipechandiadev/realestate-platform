'use client';

import React from 'react';
import { Badge } from '../Badge';
import { labelsForOtherFeatures } from '../../property/other-features';

export type OtherFeaturesChipsProps = {
  value?: string[];
  emptyLabel?: string;
  className?: string;
  /** When true and value is empty, render nothing */
  hideWhenEmpty?: boolean;
};

export function OtherFeaturesChips({
  value = [],
  emptyLabel = 'Sin otras características',
  className = '',
  hideWhenEmpty = false,
}: OtherFeaturesChipsProps) {
  const labels = labelsForOtherFeatures(value);

  if (labels.length === 0) {
    if (hideWhenEmpty) return null;
    return <p className={`text-sm text-muted-foreground ${className}`.trim()}>{emptyLabel}</p>;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {labels.map((label) => (
        <Badge key={label} variant="primary-outlined">
          {label}
        </Badge>
      ))}
    </div>
  );
}

export default OtherFeaturesChips;

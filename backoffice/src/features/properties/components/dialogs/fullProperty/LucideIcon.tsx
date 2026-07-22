'use client';

import React from 'react';
import { resolveLucideIconComponent } from '@realestate/ui';

type LucideIconProps = {
  name: string;
  size?: number;
  className?: string;
  spin?: boolean;
};

export function LucideIcon({ name, size = 16, className = '', spin = false }: LucideIconProps) {
  const Icon = resolveLucideIconComponent(name);
  return (
    <Icon
      size={size}
      className={`${className} ${spin ? 'animate-spin' : ''}`.trim()}
      aria-hidden
    />
  );
}

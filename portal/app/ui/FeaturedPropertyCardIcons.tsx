"use client";

import React from 'react';
import FontAwesome from '@/shared/components/ui/FontAwesome/FontAwesome';

interface IconStatProps {
  icon: string;
  label: string;
}

export function IconStat({ icon, label }: IconStatProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
      <FontAwesome icon={icon} size="sm" className="text-primary" />
      <span>{label}</span>
    </div>
  );
}
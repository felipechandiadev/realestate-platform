import React from 'react';
import { PageLoadingDots } from '@/shared/components/ui/PageLoadingDots/PageLoadingDots';

export default function Loading() {
  return (
    <div className="relative">
      <div className="space-y-6 w-full">
        <div className="h-9 w-64 bg-neutral animate-pulse rounded" />
        <div className="h-5 w-96 bg-neutral animate-pulse rounded" />
        <div className="h-48 w-full bg-neutral animate-pulse rounded-lg" />
      </div>
      <PageLoadingDots overlay />
    </div>
  );
}

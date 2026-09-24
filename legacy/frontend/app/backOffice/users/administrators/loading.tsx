import React from 'react';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

/**
 * Loading fallback for administrators page
 * Displayed while administrators are being fetched (Suspense boundary)
 */
export default function Loading() {
  return (
    <div className="space-y-6 w-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-neutral animate-pulse rounded" />
          <div className="h-5 w-96 bg-neutral animate-pulse rounded" />
        </div>
        <div className="h-12 w-12 bg-neutral animate-pulse rounded-full" />
      </div>

      {/* Search skeleton */}
      <div className="h-14 w-80 bg-neutral animate-pulse rounded-lg" />

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-background rounded-lg border border-border shadow-sm overflow-hidden p-6"
          >
            <div className="flex items-center gap-4">
              {/* Avatar skeleton */}
              <div className="h-24 w-24 bg-neutral animate-pulse rounded-full flex-shrink-0" />
              {/* Info skeleton */}
              <div className="flex-1 space-y-3">
                <div className="h-5 bg-neutral animate-pulse rounded" />
                <div className="h-4 bg-neutral animate-pulse rounded w-3/4" />
                <div className="h-4 bg-neutral animate-pulse rounded w-1/2" />
              </div>
            </div>
            {/* Actions skeleton */}
            <div className="flex justify-end gap-2 mt-4">
              <div className="h-8 w-8 bg-neutral animate-pulse rounded" />
              <div className="h-8 w-8 bg-neutral animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="flex justify-center py-8">
        <DotProgress />
      </div>
    </div>
  );
}

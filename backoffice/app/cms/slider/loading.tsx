import React from 'react';
import { DotProgress } from "@realestate/ui";

/**
 * Loading fallback for slider page
 * Displayed while slides are being fetched
 */
export default function Loading() {
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 bg-neutral animate-pulse rounded" />
          <div className="h-5 w-96 bg-neutral animate-pulse rounded" />
        </div>
        <div className="h-12 w-12 bg-neutral animate-pulse rounded-full" />
      </div>

      <div className="h-14 w-80 bg-neutral animate-pulse rounded-lg" />

      <div className="flex w-full flex-col gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-border shadow-sm"
          >
            <div className="h-[200px] bg-gray-100 animate-pulse md:h-[260px]" />
          </div>
        ))}
      </div>

      <div className="flex justify-center py-8">
        <DotProgress />
      </div>
    </div>
  );
}

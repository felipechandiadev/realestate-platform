import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

/**
 * Loading fallback for document types page
 * Displayed while document types are being fetched
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
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <div className="h-14 w-full bg-neutral animate-pulse rounded-lg" />
      </div>

      {/* Grid skeleton - 1/2/3 responsive with document type cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border shadow-sm p-6 flex flex-col h-full">
            {/* Header with Icon and Title */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="h-10 w-10 bg-neutral animate-pulse rounded flex-shrink-0" />
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="h-6 bg-neutral animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-neutral animate-pulse rounded w-1/2" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex-1 mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-neutral animate-pulse rounded w-full" />
                <div className="h-4 bg-neutral animate-pulse rounded w-5/6" />
              </div>
            </div>

            {/* Footer: Toggle and Actions */}
            <div className="flex justify-between items-center gap-2">
              <div className="h-9 w-32 bg-neutral animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-9 w-9 bg-neutral animate-pulse rounded" />
                <div className="h-9 w-9 bg-neutral animate-pulse rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center py-8">
        <DotProgress />
      </div>
    </div>
  );
}

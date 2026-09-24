import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

/**
 * Loading fallback for articles page
 * Displayed while articles are being fetched
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-background rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="aspect-video bg-gray-100 animate-pulse" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-neutral animate-pulse rounded" />
              <div className="h-4 bg-neutral animate-pulse rounded w-3/4" />
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

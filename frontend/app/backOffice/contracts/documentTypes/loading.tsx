import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

/**
 * Loading fallback for document types page
 * Displayed while document types are being fetched
 */
export default function Loading() {
  return (
    <div className="p-4 space-y-6 w-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <div className="h-10 w-10 bg-neutral animate-pulse rounded" />
        <div className="w-full max-w-sm h-14 bg-neutral animate-pulse rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-background rounded-lg border border-border shadow-sm p-6 space-y-4"
          >
            <div className="h-6 bg-neutral animate-pulse rounded w-3/4" />
            <div className="h-4 bg-neutral animate-pulse rounded w-full" />
            <div className="h-4 bg-neutral animate-pulse rounded w-5/6" />
            <div className="flex gap-2 pt-2">
              <div className="h-9 w-20 bg-neutral animate-pulse rounded" />
              <div className="h-9 w-20 bg-neutral animate-pulse rounded" />
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

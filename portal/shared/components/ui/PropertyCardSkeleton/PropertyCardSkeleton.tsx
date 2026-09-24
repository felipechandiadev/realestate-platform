'use client';

/**
 * PropertyCardSkeleton
 * Matches PropertyCard layout: 16/9 media, feature icons row, title/price/location, footer actions.
 * Translucent gray placeholders while properties load.
 */
export default function PropertyCardSkeleton() {
  return (
    <div
      className="relative bg-white/80 rounded-lg w-full shadow-lg overflow-hidden flex flex-col h-full border border-gray-200/50"
      aria-hidden
    >
      {/* Media — aspect 16/9 like PropertyCard */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100/50">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/45 via-gray-300/20 to-gray-200/35" />
        {/* Operation badge */}
        <div className="absolute top-2 right-2 h-6 w-16 rounded-full border-2 border-white/60 bg-gray-400/25 animate-pulse" />
      </div>

      {/* Feature icons row */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 md:py-2.5 bg-secondary/20 shrink-0">
        <div className="h-5 w-10 rounded-md bg-gray-300/35 animate-pulse" />
        <div className="h-5 w-10 rounded-md bg-gray-300/35 animate-pulse" />
        <div className="h-5 w-12 rounded-md bg-gray-300/35 animate-pulse" />
        <div className="h-5 w-10 rounded-md bg-gray-300/35 animate-pulse" />
      </div>

      {/* Type, title, price, location */}
      <div className="px-4 md:px-6 pt-2 md:pt-3 pb-2 md:pb-3 text-center flex flex-col flex-1 justify-start gap-2">
        <div className="mx-auto h-3 w-20 rounded bg-gray-300/30 animate-pulse" />
        <div className="mx-auto h-5 w-4/5 rounded-md bg-gray-300/40 animate-pulse" />
        <div className="mx-auto h-4 w-3/5 rounded-md bg-gray-300/35 animate-pulse" />
        <div className="mx-auto h-6 w-2/5 rounded-md bg-gray-400/30 animate-pulse mt-0.5" />
        <div className="mx-auto h-3 w-1/2 rounded bg-gray-300/25 animate-pulse" />
      </div>

      {/* Footer: CTA + favorite */}
      <div className="flex justify-between items-center px-4 md:px-6 py-2 border-t border-gray-100/80 mt-auto min-h-[40px] md:min-h-[52px]">
        <div className="h-8 w-28 rounded-md bg-gray-300/40 animate-pulse" />
        <div className="h-9 w-9 rounded-full bg-gray-300/30 animate-pulse" />
      </div>
    </div>
  );
}

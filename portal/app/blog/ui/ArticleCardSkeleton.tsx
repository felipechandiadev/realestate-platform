'use client';

type ArticleCardSkeletonProps = {
  /** When true, fills the parent instead of setting its own 3/4 aspect ratio. */
  fill?: boolean;
};

/**
 * Placeholder matching ArticleCard layout (3/4, badges, bottom text) with translucent gray.
 */
export default function ArticleCardSkeleton({ fill = false }: ArticleCardSkeletonProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-gray-200/50 bg-gray-100/40 ${
        fill ? 'h-full w-full shadow-none' : 'shadow-lg'
      }`}
      style={fill ? undefined : { aspectRatio: '3/4' }}
      aria-hidden
    >
      {/* Image plane — soft translucent gray */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200/45 via-gray-300/20 to-gray-200/35" />

      {/* Bottom gradient like the real card overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-500/30 via-transparent to-transparent" />

      {/* Category + date row (mirrors ArticleCard) */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="h-7 w-20 rounded-full border border-white/50 bg-white/50 backdrop-blur-sm animate-pulse" />
        <div className="h-7 w-24 rounded-lg bg-black/10 backdrop-blur-sm animate-pulse" />
      </div>

      {/* Title + subtitle block (mirrors ArticleCard bottom content) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 space-y-2.5">
        <div className="h-5 w-[92%] rounded-md bg-white/40 animate-pulse" />
        <div className="h-5 w-[78%] rounded-md bg-white/35 animate-pulse" />
        <div className="mt-1 h-3 w-[58%] rounded-md bg-white/25 animate-pulse" />
      </div>
    </div>
  );
}

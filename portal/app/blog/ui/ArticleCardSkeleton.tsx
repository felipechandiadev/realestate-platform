'use client';

import { PORTAL_SKELETON } from '@/shared/components/ui/PortalSkeleton/portal-skeleton';

type ArticleCardSkeletonProps = {
  /** When true, fills the parent instead of setting its own 3/4 aspect ratio. */
  fill?: boolean;
};

/**
 * Placeholder matching ArticleCard layout. Neutral gray only — never theme muted/secondary.
 */
export default function ArticleCardSkeleton({ fill = false }: ArticleCardSkeletonProps) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-gray-200 bg-white ${
        fill ? 'h-full w-full shadow-none' : 'shadow-lg'
      }`}
      style={fill ? undefined : { aspectRatio: '3/4' }}
      aria-hidden
    >
      <div
        className="absolute inset-0 animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${PORTAL_SKELETON.base} 0%, ${PORTAL_SKELETON.soft} 50%, ${PORTAL_SKELETON.base} 100%)`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(107,114,128,0.25), transparent 55%)',
        }}
      />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div
          className="h-7 w-20 rounded-full animate-pulse border border-white/60"
          style={{ backgroundColor: 'rgba(255,255,255,0.55)' }}
        />
        <div
          className="h-7 w-24 rounded-lg animate-pulse"
          style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 z-10 space-y-2.5">
        <div className="h-5 w-[92%] rounded-md animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.45)' }} />
        <div className="h-5 w-[78%] rounded-md animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <div className="mt-1 h-3 w-[58%] rounded-md animate-pulse" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
      </div>
    </div>
  );
}

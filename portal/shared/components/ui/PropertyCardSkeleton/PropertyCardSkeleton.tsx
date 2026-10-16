'use client';

import { PORTAL_SKELETON } from '@/shared/components/ui/PortalSkeleton/portal-skeleton';

/**
 * PropertyCardSkeleton
 * Matches PropertyCard layout. Neutral gray only — never theme muted/secondary.
 */
function Bone({ className, color = PORTAL_SKELETON.base }: { className: string; color?: string }) {
  return <div className={`animate-pulse rounded-md ${className}`} style={{ backgroundColor: color }} />;
}

export default function PropertyCardSkeleton() {
  return (
    <div
      className="relative bg-white rounded-lg w-full shadow-lg overflow-hidden flex flex-col h-full border border-gray-200"
      aria-hidden
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden" style={{ backgroundColor: PORTAL_SKELETON.soft }}>
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${PORTAL_SKELETON.base} 0%, ${PORTAL_SKELETON.soft} 50%, ${PORTAL_SKELETON.base} 100%)`,
          }}
        />
        <Bone className="absolute top-2 right-2 h-6 w-16 rounded-full" color={PORTAL_SKELETON.mid} />
      </div>

      <div
        className="flex items-center justify-center gap-3 px-4 py-2 md:py-2.5 shrink-0"
        style={{ backgroundColor: PORTAL_SKELETON.soft }}
      >
        <Bone className="h-5 w-10" color={PORTAL_SKELETON.mid} />
        <Bone className="h-5 w-10" color={PORTAL_SKELETON.mid} />
        <Bone className="h-5 w-12" color={PORTAL_SKELETON.mid} />
        <Bone className="h-5 w-10" color={PORTAL_SKELETON.mid} />
      </div>

      <div className="px-4 md:px-6 pt-2 md:pt-3 pb-2 md:pb-3 text-center flex flex-col flex-1 justify-start gap-2">
        <Bone className="mx-auto h-3 w-20 rounded" />
        <Bone className="mx-auto h-5 w-4/5" color={PORTAL_SKELETON.mid} />
        <Bone className="mx-auto h-4 w-3/5" />
        <Bone className="mx-auto h-6 w-2/5 mt-0.5" color={PORTAL_SKELETON.mid} />
        <Bone className="mx-auto h-3 w-1/2 rounded" color={PORTAL_SKELETON.soft} />
      </div>

      <div className="flex justify-between items-center px-4 md:px-6 py-2 border-t border-gray-100 mt-auto min-h-[40px] md:min-h-[52px]">
        <Bone className="h-8 w-28" color={PORTAL_SKELETON.mid} />
        <Bone className="h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

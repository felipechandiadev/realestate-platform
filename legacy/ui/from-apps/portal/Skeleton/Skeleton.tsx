'use client';

interface SkeletonProps {
  className?: string;
  count?: number;
}

/**
 * Skeleton Loader component
 * Provides animated placeholder while content is loading
 */
export default function Skeleton({ className = 'h-12 w-full', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${className} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse`}
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s infinite',
          }}
        />
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}

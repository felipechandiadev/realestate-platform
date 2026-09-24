'use client';

import Skeleton from '@/shared/components/ui/Skeleton/Skeleton';

/**
 * PropertyCardSkeleton
 * Skeleton loader for PropertyCard component
 * Matches PropertyCard layout for consistent placeholder
 */
export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 animate-pulse">
      {/* Image placeholder */}
      <div className="relative w-full h-48 bg-gray-200" />
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Skeleton className="h-4 w-3/4" />
        
        {/* Location */}
        <Skeleton className="h-3 w-1/2" />
        
        {/* Price */}
        <Skeleton className="h-6 w-2/5" />
        
        {/* Features row */}
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

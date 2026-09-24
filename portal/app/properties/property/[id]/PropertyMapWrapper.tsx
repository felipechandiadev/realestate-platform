'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface PropertyMapWrapperProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  city?: string;
  state?: string;
}

function MapLoadingFallback() {
  return (
    <div
      className="flex w-full items-center justify-center overflow-hidden rounded-lg border border-border"
      style={{ height: '400px' }}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
    </div>
  );
}

const PropertyMapClient = dynamic(() => import('./PropertyMap'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

export default function PropertyMapWrapper(props: PropertyMapWrapperProps) {
  return (
    <Suspense fallback={<MapLoadingFallback />}>
      <PropertyMapClient {...props} />
    </Suspense>
  );
}

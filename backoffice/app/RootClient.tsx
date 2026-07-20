'use client';

import FullScreenLoader from '@/shared/components/ui/FullScreenLoader/FullScreenLoader';
import { useAssetsCacheDetection } from '@/shared/hooks/useAssetsCacheDetection';
import { usePathname } from 'next/navigation';
import { useSliderImagesReady } from '@/providers/SliderImagesReadyContext';
import { useSplashCompleted } from '@/providers/SplashCompletedContext';
import { useEffect } from 'react';

interface RootClientProps {
  children: React.ReactNode;
}

/**
 * Client wrapper for root layout to handle global loading screen
 * Shows loader on first app load when:
 * - NOT already completed in this session
 * - Assets aren't cached AND
 * - Fonts are still loading
 * - AND route is /portal (only for portal pages)
 * 
 * Also waits for slider images to fully load on /portal when no cache
 * 
 * Once splash disappears, it NEVER appears again in this session
 */
export default function RootClient({ children }: RootClientProps) {
  const { isFromCache, isReady } = useAssetsCacheDetection();
  const pathname = usePathname();
  const { areSliderImagesReady } = useSliderImagesReady();
  const { splashCompleted, setSplashCompleted } = useSplashCompleted();

  // Show loader only if:
  // - Splash hasn't completed yet in this session AND
  // - On /portal route AND
  // - NOT from cache AND
  // - NOT ready (waiting for fonts) OR slider images not ready
  const isPortalRoute = pathname.startsWith('/portal');
  const shouldShowLoader = !splashCompleted && isPortalRoute && !isFromCache && (!isReady || !areSliderImagesReady);

  // Mark splash as completed once it should be hidden
  useEffect(() => {
    if (!shouldShowLoader && isPortalRoute) {
      setSplashCompleted(true);
    }
  }, [shouldShowLoader, isPortalRoute, setSplashCompleted]);

  return (
    <>
      {/* Global full-screen loader - waits for fonts to load */}
      <FullScreenLoader 
        isVisible={shouldShowLoader}
        // No duration limit here, waits for fonts (max 4s timeout in hook)
      />

      {/* App content */}
      {children}
    </>
  );
}

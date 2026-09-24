'use client';

import React, { useEffect, useState } from 'react';
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress';

interface FullScreenLoaderProps {
  isVisible: boolean;
  duration?: number; // milliseconds (optional, ignored if not set)
  onComplete?: () => void;
}

/**
 * Full-screen loading overlay for app initialization
 * Shows EstateFlow branding + loading animation
 * 
 * Features:
 * - Covers entire viewport with z-index 50
 * - Optional duration timer (if not set, waits for isVisible to become false)
 * - Animated entrance/exit
 */
export default function FullScreenLoader({
  isVisible,
  duration,
  onComplete,
}: FullScreenLoaderProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (!isVisible) {
      // Fade out
      setShouldRender(false);
      onComplete?.();
      return;
    }

    // Fade in
    setShouldRender(true);

    // If duration is set, auto-hide after that time
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setShouldRender(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }

    // If no duration, wait for isVisible to become false externally
  }, [isVisible, duration, onComplete]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-background animate-in fade-in duration-300" style={{ zIndex: 9999 }}>
      <h1 className="text-5xl md:text-6xl font-bold text-primary">
        EstateFlow
      </h1>

      <p className="text-lg text-foreground">
        Servicios Inmobiliarios
      </p>

      <DotProgress className="justify-center" />
    </div>
  );
}

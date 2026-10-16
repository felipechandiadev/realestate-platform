'use client';

import { DotProgress } from '@realestate/ui';

const pageLoadingClassName =
  'flex w-full items-center justify-center min-h-[calc(100dvh-4.5rem)] sm:min-h-[calc(100dvh-7rem)]';

export function PageLoadingDots({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className={
        overlay
          ? 'pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[calc(100dvh-4.5rem)] items-center justify-center sm:h-[calc(100dvh-7rem)]'
          : pageLoadingClassName
      }
    >
      <DotProgress count={3} variant="wave" />
    </div>
  );
}

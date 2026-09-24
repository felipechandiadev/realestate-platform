'use client';

import React, { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconButton } from '@realestate/ui';

type CommunityUserMoreButtonProps = {
  user: { id: string };
};

export default function CommunityUserMoreButton({ user }: CommunityUserMoreButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpen = useCallback(() => {
    const search = searchParams.toString();
    const returnTo = `${pathname}${search ? `?${search}` : ''}`;
    const qs = new URLSearchParams();
    qs.set('returnTo', returnTo);
    router.push(
      `/users/community/${encodeURIComponent(user.id)}?${qs.toString()}`,
    );
  }, [pathname, user.id, router, searchParams]);

  return (
    <div className="flex h-full flex-shrink-0 items-center justify-center">
      <IconButton
        icon="more_horiz"
        variant="text"
        size="xs"
        ariaLabel="Ver detalles del usuario"
        title="Ver detalles"
        onClick={handleOpen}
        data-test-id="community-user-more-btn"
      />
    </div>
  );
}

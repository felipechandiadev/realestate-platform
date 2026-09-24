'use client';

import React, { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconButton } from '@realestate/ui';

interface RentMoreButtonProps {
  property: { id: string };
}

const RentMoreButton: React.FC<RentMoreButtonProps> = ({ property }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpen = useCallback(() => {
    const search = searchParams.toString();
    const returnTo = `${pathname}${search ? `?${search}` : ''}`;
    const qs = new URLSearchParams();
    qs.set('returnTo', returnTo);
    router.push(`/properties/rent/${encodeURIComponent(property.id)}?${qs.toString()}`);
  }, [pathname, property.id, router, searchParams]);

  return (
    <div className="flex h-full flex-shrink-0 items-center justify-center">
      <IconButton
        icon="more_horiz"
        variant="text"
        size="xs"
        ariaLabel="Ver más detalles"
        onClick={handleOpen}
        data-test-id="rent-more-btn"
      />
    </div>
  );
};

export default RentMoreButton;

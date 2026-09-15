'use client';

import React, { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { IconButton } from '@realestate/ui';

type ContractMoreButtonProps = {
  contractId: string;
  detailBasePath: '/contracts/sales' | '/contracts/rent';
};

export default function ContractMoreButton({
  contractId,
  detailBasePath,
}: ContractMoreButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpen = useCallback(() => {
    const search = searchParams.toString();
    const returnTo = `${pathname}${search ? `?${search}` : ''}`;
    const qs = new URLSearchParams();
    qs.set('returnTo', returnTo);
    router.push(`${detailBasePath}/${encodeURIComponent(contractId)}?${qs.toString()}`);
  }, [contractId, detailBasePath, pathname, router, searchParams]);

  return (
    <div className="flex h-full flex-shrink-0 items-center justify-center">
      <IconButton
        icon="more_horiz"
        variant="text"
        size="xs"
        ariaLabel="Ver detalles del contrato"
        onClick={handleOpen}
        title="Ver detalles"
        data-test-id="contract-more-btn"
      />
    </div>
  );
}

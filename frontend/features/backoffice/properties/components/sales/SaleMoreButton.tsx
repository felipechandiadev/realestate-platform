'use client';

import React, { useState, useCallback } from 'react';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import FullPropertyDialog from '@/features/backoffice/properties/components/dialogs/fullProperty/FullPropertyDialog';
import { useFullPropertyRevalidation } from '@/shared/hooks/useFullPropertyRevalidation';


interface SaleMoreButtonProps {
  property: any;
}

const SaleMoreButton: React.FC<SaleMoreButtonProps> = ({ property }) => {
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({});
  const { revalidate } = useFullPropertyRevalidation();

  const isOpen = openDialogs[property.id] || false;

  const handleOpen = useCallback(() => {
    setOpenDialogs(prev => ({
      ...prev,
      [property.id]: true
    }));
  }, [property.id]);

  const handleClose = useCallback(async () => {
    setOpenDialogs(prev => ({
      ...prev,
      [property.id]: false
    }));
    // Revalidate the current route to refresh the sales grid
    await revalidate();
  }, [property.id, revalidate]);

  return (
    <>
      <div className="flex h-full items-center justify-center flex-shrink-0">
        <IconButton
          icon="more_horiz"
          variant="text"
          size="xs"
          ariaLabel="Ver más detalles"
          onClick={handleOpen}
          data-test-id="sale-more-btn"
        />
      </div>
      <FullPropertyDialog
        open={isOpen}
        onClose={handleClose}
        propertyId={property.id}
      />
    </>
  );
};

export default SaleMoreButton;

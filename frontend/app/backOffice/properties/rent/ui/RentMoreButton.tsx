'use client';

import React, { useState, useCallback } from 'react';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import FullPropertyDialog from '@/features/backoffice/properties/components/dialogs/fullProperty/FullPropertyDialog';
import { useFullPropertyRevalidation } from '@/shared/hooks/useFullPropertyRevalidation';

interface RentMoreButtonProps {
  property: any;
}

const RentMoreButton: React.FC<RentMoreButtonProps> = ({ property }) => {
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
    // Revalidate the current route to refresh the rent grid
    await revalidate();
  }, [property.id, revalidate]);

  return (
    <div className="flex-shrink-0 w-fit">
      <IconButton
        icon="more_horiz"
        variant="text"
        size="xs"
        ariaLabel="Ver más detalles"
        onClick={handleOpen}
        data-test-id="rent-more-btn"
      />
      <FullPropertyDialog 
        open={isOpen} 
        onClose={handleClose}
        propertyId={property.id}
      />
    </div>
  );
};

export default RentMoreButton;

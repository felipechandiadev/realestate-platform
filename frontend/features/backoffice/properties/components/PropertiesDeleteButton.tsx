/**
 * @fileoverview Delete property button component
 *
 * Client component for deleting a property with confirmation
 * Uses useDeleteProperty mutation hook
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button/Button';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { useDeleteProperty } from '@/features/backoffice/properties/hooks';
import IconButton from '@/shared/components/ui/IconButton/IconButton';

interface PropertiesDeleteButtonProps {
  propertyId: string;
  onSuccess?: () => void;
}

/**
 * Button that triggers property deletion with confirmation
 */
export function PropertiesDeleteButton({
  propertyId,
  onSuccess,
}: PropertiesDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate: deleteProperty, isPending } = useDeleteProperty();

  const handleConfirm = () => {
    deleteProperty(propertyId, {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
      onError: (error: Error) => {
        console.error('Delete error:', error);
        alert(`Error al eliminar: ${error.message}`);
      },
    });
  };

  return (
    <>
      <IconButton
        icon="delete"
        variant="basicSecondary"
        onClick={() => setOpen(true)}
        disabled={isPending}
        aria-label="Eliminar propiedad"
      />

      <Dialog open={open} onOpenChange={setOpen} title="Confirmar eliminación">
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro que desea eliminar esta propiedad? Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => setOpen(false)}
              variant="secondary"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="danger"
              disabled={isPending}
              loading={isPending}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default PropertiesDeleteButton;

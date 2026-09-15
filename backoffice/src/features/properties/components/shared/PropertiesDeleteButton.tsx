/**
 * @fileoverview Delete property button component
 *
 * Client component for deleting a property with confirmation
 * Uses useDeleteProperty mutation hook
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@realestate/ui';
import { Dialog } from "@realestate/ui";
import { useDeleteProperty } from '@/features/properties/hooks';
import { IconButton } from "@realestate/ui";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: deleteProperty, isPending } = useDeleteProperty();
  const busy = isPending || isSubmitting;

  const openDialog = () => {
    setIsSubmitting(false);
    setOpen(true);
  };

  const handleConfirm = () => {
    if (busy) return;
    setIsSubmitting(true);
    deleteProperty(propertyId, {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
        // Keep isSubmitting true until reopen so the button stays disabled during close animation.
      },
      onError: (error: Error) => {
        console.error('Delete error:', error);
        alert(`Error al eliminar: ${error.message}`);
        setIsSubmitting(false);
      },
    });
  };

  return (
    <>
      <IconButton
        icon="delete"
        variant="basicSecondary"
        onClick={openDialog}
        disabled={busy}
        aria-label="Eliminar propiedad"
      />

      <Dialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title="Confirmar eliminación"
        disableBackdropClick={busy}
        persistent={busy}
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            ¿Está seguro que desea eliminar esta propiedad? Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              onClick={() => !busy && setOpen(false)}
              variant="secondary"
              disabled={busy}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              variant="danger"
              disabled={busy}
              loading={busy}
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

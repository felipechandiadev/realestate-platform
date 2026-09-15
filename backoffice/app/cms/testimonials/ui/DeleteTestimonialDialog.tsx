'use client';

import { useEffect, useState } from 'react';
import { Dialog } from "@realestate/ui";
import { Button } from '@realestate/ui';
import { deleteTestimonial } from '@/features/cms/actions/testimonials.action';

export interface Testimonial {
  id: string;
  name: string;
  content: string;
  position?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteTestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testimonial: Testimonial | null;
}

const DeleteTestimonialDialog: React.FC<DeleteTestimonialDialogProps> = ({
  open,
  onClose,
  onSuccess,
  testimonial,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = require('@/providers/AlertContext').useAlert();

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirmDelete = async () => {
    if (!testimonial || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await deleteTestimonial(testimonial.id);
      if (result.success) {
        success('Testimonio eliminado exitosamente');
        onClose();
        onSuccess();
        return;
      }
      error(result.error || 'Error al eliminar testimonio');
      setIsSubmitting(false);
    } catch (err) {
      error('Error interno del servidor');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Eliminar Testimonio"
      maxWidth="sm"
      disableBackdropClick={isSubmitting}
      persistent={isSubmitting}
    >
      <div className="space-y-4">
        <p className="text-foreground">
          ¿Estás seguro de que quieres eliminar el testimonio de <strong>{testimonial?.name}</strong>?
        </p>
        <p className="text-sm text-muted-foreground">
          Esta acción no se puede deshacer.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default DeleteTestimonialDialog;

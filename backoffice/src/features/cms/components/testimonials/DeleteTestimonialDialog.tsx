'use client';

import { useEffect, useState } from 'react';
import { Dialog } from "@realestate/ui";
import { Button } from '@realestate/ui';
import { deleteTestimonial, type Testimonial } from '@/features/cms/actions/testimonials.action';
import { useAlert } from '@/providers/AlertContext';

export interface DeleteTestimonialDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  testimonial: Testimonial | null;
}

export function DeleteTestimonialDialog({
  open,
  onClose,
  onSuccess,
  testimonial,
}: DeleteTestimonialDialogProps) {
  const alert = useAlert();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!testimonial || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await deleteTestimonial(testimonial.id);

      if (result.success) {
        alert.success('Testimonio eliminado correctamente');
        onClose();
        onSuccess();
        return;
      }
      alert.error(result.error || 'Error al eliminar testimonio');
      setIsSubmitting(false);
    } catch (err) {
      alert.error('Error interno del servidor');
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
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">⚠️ Advertencia</h3>
          <p className="text-sm text-red-800">
            Estás a punto de eliminar el testimonio de <strong>{testimonial?.name}</strong>. Esta acción
            no se puede deshacer.
          </p>
        </div>

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
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? 'Eliminando...' : 'Eliminar Testimonio'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

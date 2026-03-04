'use client';

import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { deleteTestimonial, type Testimonial } from '@/features/backoffice/cms/actions/testimonials.action';
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

  const handleConfirm = async () => {
    if (!testimonial) return;

    setIsSubmitting(true);
    try {
      const result = await deleteTestimonial(testimonial.id);

      if (result.success) {
        alert.success('Testimonio eliminado correctamente');
        onClose();
        onSuccess();
      } else {
        alert.error(result.error || 'Error al eliminar testimonio');
      }
    } catch (err) {
      alert.error('Error interno del servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Eliminar Testimonio"
      maxWidth="sm"
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

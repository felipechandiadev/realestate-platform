import { useState } from 'react';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { deleteTestimonial } from '@/features/backoffice/cms/actions/testimonials.action';

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

  const handleClose = () => {
    onClose();
  };

  const handleConfirmDelete = async () => {
    if (!testimonial) return;

    setIsSubmitting(true);
    try {
      const result = await deleteTestimonial(testimonial.id);
      if (result.success) {
        success('Testimonio eliminado exitosamente');
        handleClose();
        onSuccess();
      } else {
        error(result.error || 'Error al eliminar testimonio');
      }
    } catch (err) {
      error('Error interno del servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Eliminar Testimonio"
      maxWidth="sm"
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